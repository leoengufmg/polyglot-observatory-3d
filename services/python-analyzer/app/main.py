from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any, Literal
from urllib.error import URLError
from urllib.request import Request, urlopen

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

Language = Literal["python", "javascript", "typescript", "java", "ruby"]
StageStatus = Literal["idle", "running", "success", "error"]

JAVA_BENCHMARK_URL = os.getenv("JAVA_BENCHMARK_URL", "http://localhost:8080")
RUBY_REPORTER_URL = os.getenv("RUBY_REPORTER_URL", "http://localhost:4567")


def locate_workloads_dir() -> Path:
    current = Path(__file__).resolve()
    for candidate in [current.parent, *current.parents]:
        workloads = candidate / "shared" / "workloads"
        if workloads.exists():
            return workloads
    raise RuntimeError("shared/workloads directory was not found")


WORKLOADS_DIR = locate_workloads_dir()

app = FastAPI(title="Polyglot Observatory Analyzer", version="0.2.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    workload_id: str
    language: Language
    code: str


class PipelineStage(BaseModel):
    id: str
    label: str
    status: StageStatus


def load_workloads() -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for file_path in sorted(WORKLOADS_DIR.glob("*.json")):
        payload.append(json.loads(file_path.read_text(encoding="utf-8")))
    return payload


def find_workload(workload_id: str) -> dict[str, Any]:
    for workload in load_workloads():
        if workload["id"] == workload_id:
            return workload
    raise HTTPException(status_code=404, detail=f"Workload '{workload_id}' was not found")


def call_service(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=3) as response:
        return json.loads(response.read().decode("utf-8"))


def build_tests(expected_signals: list[str], code: str) -> list[dict[str, str]]:
    lower_code = code.lower()
    checks = [
        ("Signature signal", expected_signals[0]),
        ("Control flow", "if"),
        ("Iteration or traversal", "for"),
        ("Readable return path", "return"),
    ]
    tests: list[dict[str, str]] = []

    for name, token in checks:
        found = token.lower() in lower_code
        status = "pass" if found else "warn"
        detail = f"Detected token '{token}' in the implementation." if found else f"Token '{token}' was not detected."
        tests.append({"name": name, "status": status, "detail": detail})

    missing_expected = [token for token in expected_signals if token.lower() not in lower_code]
    if missing_expected:
        tests.append(
            {
                "name": "Workload-specific signals",
                "status": "warn",
                "detail": f"Missing expected patterns: {', '.join(missing_expected[:3])}.",
            }
        )
    else:
        tests.append(
            {
                "name": "Workload-specific signals",
                "status": "pass",
                "detail": "All expected workload patterns were found.",
            }
        )

    return tests


def build_pipeline(score: int, tests: list[dict[str, str]]) -> list[PipelineStage]:
    checks_status: StageStatus = "success" if all(test["status"] == "pass" for test in tests) else "running"
    benchmark_status: StageStatus = "success" if score >= 70 else "error"
    return [
        PipelineStage(id="ingest", label="Ingest", status="success"),
        PipelineStage(id="checks", label="Checks", status=checks_status),
        PipelineStage(id="benchmark", label="Benchmark", status=benchmark_status),
        PipelineStage(id="report", label="Report", status="success"),
    ]


def analyze_implementation(workload: dict[str, Any], language: Language, code: str) -> tuple[int, list[dict[str, str]], list[str]]:
    expected_signals: list[str] = workload["expectedSignals"][language]
    lower_code = code.lower()
    matched = [token for token in expected_signals if token.lower() in lower_code]
    tests = build_tests(expected_signals, code)

    base_score = 45 + len(matched) * 10
    service_notes = [f"Python analyzer matched {len(matched)} of {len(expected_signals)} expected signals."]

    if len(code.splitlines()) >= 6:
        base_score += 5
        service_notes.append("Implementation has enough structure to produce a useful technical report.")

    if language == "java":
        try:
            java_payload = call_service(
                f"{JAVA_BENCHMARK_URL}/benchmark",
                {
                    "workloadId": workload["id"],
                    "language": language,
                    "code": code,
                },
            )
            base_score += int(java_payload.get("benchmarkBonus", 0))
            service_notes.extend(java_payload.get("notes", []))
        except URLError:
            service_notes.append("Java benchmark service was unavailable; language-specific metrics were skipped.")

    return min(base_score, 100), tests, service_notes


def build_summary(workload: dict[str, Any], language: Language, score: int) -> str:
    if score >= 85:
        grade = "strong"
    elif score >= 70:
        grade = "promising"
    else:
        grade = "incomplete"

    return (
        f"The {language} implementation for {workload['title']} produced a {grade} result. "
        "The pipeline detected stable implementation signals and generated a reusable technical report."
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "python-analyzer"}


@app.get("/workloads")
def workloads() -> list[dict[str, Any]]:
    return [
        {
            "id": workload["id"],
            "title": workload["title"],
            "difficulty": workload["difficulty"],
            "description": workload["description"],
            "prompt": workload["prompt"],
            "sampleCode": workload["sampleCode"],
        }
        for workload in load_workloads()
    ]


@app.post("/analyze")
def analyze(payload: AnalyzeRequest) -> dict[str, Any]:
    workload = find_workload(payload.workload_id)
    score, tests, service_notes = analyze_implementation(workload, payload.language, payload.code)
    pipeline = build_pipeline(score, tests)
    summary = build_summary(workload, payload.language, score)

    report_markdown = (
        f"# {workload['title']}\n\n"
        f"Language: {payload.language}\n"
        f"Score: {score}\n\n"
        "Ruby reporter was not available.\n"
    )

    try:
        ruby_report = call_service(
            f"{RUBY_REPORTER_URL}/report",
            {
                "workloadTitle": workload["title"],
                "language": payload.language,
                "score": score,
                "tests": tests,
            },
        )
        report_markdown = ruby_report.get("markdown", report_markdown)
        service_notes.extend(ruby_report.get("highlights", []))
    except URLError:
        service_notes.append("Ruby reporter was unavailable; a fallback report was generated in Python.")

    return {
        "score": score,
        "summary": summary,
        "tests": tests,
        "pipeline": [stage.model_dump() for stage in pipeline],
        "reportMarkdown": report_markdown,
        "serviceNotes": service_notes,
    }

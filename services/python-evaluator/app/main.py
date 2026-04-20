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

JAVA_RUNNER_URL = os.getenv("JAVA_RUNNER_URL", "http://localhost:8080")
RUBY_REPORTER_URL = os.getenv("RUBY_REPORTER_URL", "http://localhost:4567")


def locate_challenges_dir() -> Path:
    current = Path(__file__).resolve()
    for candidate in [current.parent, *current.parents]:
        challenges = candidate / "shared" / "challenges"
        if challenges.exists():
            return challenges
    raise RuntimeError("shared/challenges directory was not found")


CHALLENGES_DIR = locate_challenges_dir()

app = FastAPI(title="AI Coding Trainer Evaluator", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class EvaluateRequest(BaseModel):
    challenge_id: str
    language: Language
    code: str


class PipelineStage(BaseModel):
    id: str
    label: str
    status: StageStatus


class TestResult(BaseModel):
    name: str
    status: Literal["pass", "warn", "fail"]
    detail: str


def load_challenges() -> list[dict[str, Any]]:
    payload: list[dict[str, Any]] = []
    for file_path in sorted(CHALLENGES_DIR.glob("*.json")):
        payload.append(json.loads(file_path.read_text(encoding="utf-8")))
    return payload


def find_challenge(challenge_id: str) -> dict[str, Any]:
    for challenge in load_challenges():
        if challenge["id"] == challenge_id:
            return challenge
    raise HTTPException(status_code=404, detail=f"Challenge '{challenge_id}' was not found")


def call_service(url: str, payload: dict[str, Any]) -> dict[str, Any]:
    request = Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urlopen(request, timeout=3) as response:
        return json.loads(response.read().decode("utf-8"))


def build_tests(required_tokens: list[str], code: str) -> list[dict[str, str]]:
    lower_code = code.lower()
    checks = [
        ("Signature coverage", required_tokens[0]),
        ("Control flow", "if"),
        ("Iteration or traversal", "for"),
        ("Readable return path", "return"),
    ]
    tests: list[dict[str, str]] = []

    for name, token in checks:
        found = token.lower() in lower_code
        status = "pass" if found else "warn"
        detail = f"Detected token '{token}' in the submission." if found else f"Token '{token}' was not detected."
        tests.append({"name": name, "status": status, "detail": detail})

    missing_required = [token for token in required_tokens if token.lower() not in lower_code]
    if missing_required:
        tests.append(
            {
                "name": "Challenge-specific signals",
                "status": "warn",
                "detail": f"Missing expected patterns: {', '.join(missing_required[:3])}.",
            }
        )
    else:
        tests.append(
            {
                "name": "Challenge-specific signals",
                "status": "pass",
                "detail": "All expected challenge patterns were found.",
            }
        )

    return tests


def build_pipeline(score: int, tests: list[dict[str, str]]) -> list[PipelineStage]:
    tests_status: StageStatus = "success" if all(test["status"] == "pass" for test in tests) else "running"
    score_status: StageStatus = "success" if score >= 70 else "error"
    return [
        PipelineStage(id="submission", label="Submission", status="success"),
        PipelineStage(id="tests", label="Tests", status=tests_status),
        PipelineStage(id="score", label="Score", status=score_status),
        PipelineStage(id="feedback", label="Feedback", status="success"),
    ]


def score_submission(challenge: dict[str, Any], language: Language, code: str) -> tuple[int, list[dict[str, str]], list[str]]:
    required_tokens: list[str] = challenge["requiredTokens"][language]
    lower_code = code.lower()
    matched = [token for token in required_tokens if token.lower() in lower_code]
    tests = build_tests(required_tokens, code)

    base_score = 45 + len(matched) * 10
    service_notes = [
        f"Python evaluator matched {len(matched)} of {len(required_tokens)} required signals.",
    ]

    if len(code.splitlines()) >= 6:
        base_score += 5
        service_notes.append("Submission has enough structure to produce explainable feedback.")

    if language == "java":
        try:
            java_payload = call_service(
                f"{JAVA_RUNNER_URL}/score",
                {
                    "challengeId": challenge["id"],
                    "language": language,
                    "code": code,
                },
            )
            base_score += int(java_payload.get("bonusScore", 0))
            service_notes.extend(java_payload.get("notes", []))
        except URLError:
            service_notes.append("Java runner was unavailable; bonus scoring was skipped.")

    return min(base_score, 100), tests, service_notes


def build_summary(challenge: dict[str, Any], language: Language, score: int) -> str:
    if score >= 85:
        grade = "strong"
    elif score >= 70:
        grade = "promising"
    else:
        grade = "incomplete"

    return (
        f"The {language} submission for {challenge['title']} produced a {grade} result. "
        "The pipeline detected useful implementation signals and generated feedback that can be used in AI training workflows."
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "python-evaluator"}


@app.get("/challenges")
def challenges() -> list[dict[str, Any]]:
    return [
        {
            "id": challenge["id"],
            "title": challenge["title"],
            "difficulty": challenge["difficulty"],
            "description": challenge["description"],
            "prompt": challenge["prompt"],
            "starterCode": challenge["starterCode"],
        }
        for challenge in load_challenges()
    ]


@app.post("/evaluate")
def evaluate(payload: EvaluateRequest) -> dict[str, Any]:
    challenge = find_challenge(payload.challenge_id)
    score, tests, service_notes = score_submission(challenge, payload.language, payload.code)
    pipeline = build_pipeline(score, tests)
    summary = build_summary(challenge, payload.language, score)

    report_markdown = (
        f"# {challenge['title']}\n\n"
        f"Language: {payload.language}\n"
        f"Score: {score}\n\n"
        "Ruby reporter was not available.\n"
    )

    try:
        ruby_report = call_service(
            f"{RUBY_REPORTER_URL}/report",
            {
                "challengeTitle": challenge["title"],
                "language": payload.language,
                "score": score,
                "tests": tests,
            },
        )
        report_markdown = ruby_report.get("markdown", report_markdown)
        service_notes.extend(ruby_report.get("highlights", []))
    except URLError:
        service_notes.append("Ruby reporter was unavailable; fallback report was generated in Python.")

    return {
        "score": score,
        "summary": summary,
        "tests": tests,
        "pipeline": [stage.model_dump() for stage in pipeline],
        "reportMarkdown": report_markdown,
        "serviceNotes": service_notes,
    }

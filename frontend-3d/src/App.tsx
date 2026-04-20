import { FormEvent, Suspense, lazy, useEffect, useState } from "react";
import { analyzeImplementation, fetchWorkloads } from "./lib/api";
import { AnalysisResult, Language, PipelineStage, Workload } from "./types";

const PipelineCanvas = lazy(() =>
  import("./components/PipelineCanvas").then((module) => ({ default: module.PipelineCanvas }))
);

const languages: Language[] = ["python", "javascript", "typescript", "java", "ruby"];

const idlePipeline: PipelineStage[] = [
  { id: "ingest", label: "Ingest", status: "idle" },
  { id: "checks", label: "Checks", status: "idle" },
  { id: "benchmark", label: "Benchmark", status: "idle" },
  { id: "report", label: "Report", status: "idle" }
];

function App() {
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [selectedWorkloadId, setSelectedWorkloadId] = useState("");
  const [language, setLanguage] = useState<Language>("typescript");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>(idlePipeline);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadWorkloads() {
      const nextWorkloads = await fetchWorkloads();
      setWorkloads(nextWorkloads);
      setSelectedWorkloadId(nextWorkloads[0]?.id ?? "");
      setLoading(false);
    }

    void loadWorkloads();
  }, []);

  const selectedWorkload = workloads.find((workload) => workload.id === selectedWorkloadId);

  useEffect(() => {
    if (!selectedWorkload) {
      return;
    }

    setCode(selectedWorkload.sampleCode[language]);
    setResult(null);
    setPipeline(idlePipeline);
  }, [selectedWorkloadId, language, selectedWorkload]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedWorkload) {
      return;
    }

    setSubmitting(true);
    setPipeline([
      { id: "ingest", label: "Ingest", status: "success" },
      { id: "checks", label: "Checks", status: "running" },
      { id: "benchmark", label: "Benchmark", status: "idle" },
      { id: "report", label: "Report", status: "idle" }
    ]);

    const analysis = await analyzeImplementation(selectedWorkload.id, selectedWorkload.title, language, code);
    setResult(analysis);
    setPipeline(analysis.pipeline);
    setSubmitting(false);
  }

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Polyglot Engineering Portfolio</p>
          <h1>Polyglot Observatory 3D</h1>
          <p className="hero-copy">
            Compare small multi-language implementations and inspect checks, benchmark signals, and generated reports in a custom Three.js scene.
          </p>
        </div>
        <div className="hero-stat">
          <span className="hero-stat-label">Integrated stack</span>
          <strong>TS + JS + Python + Java + Ruby</strong>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel panel-canvas">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">3D Observatory Graph</p>
              <h2>Pipeline telemetry</h2>
            </div>
            <span className={`score-chip ${result ? "score-chip-live" : ""}`}>{result ? `${result.score}/100` : "waiting"}</span>
          </div>
          <Suspense fallback={<div className="pipeline-canvas pipeline-canvas-loading">Loading 3D scene...</div>}>
            <PipelineCanvas stages={pipeline} />
          </Suspense>
          <div className="stage-grid">
            {pipeline.map((stage) => (
              <article className={`stage-card stage-${stage.status}`} key={stage.id}>
                <span className="stage-label">{stage.label}</span>
                <strong>{stage.status}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="panel panel-workbench">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Implementation Workbench</p>
              <h2>Inspect and analyze a workload</h2>
            </div>
          </div>

          {loading ? (
            <p>Loading workload catalog...</p>
          ) : selectedWorkload ? (
            <form className="workbench-form" onSubmit={handleSubmit}>
              <div className="control-row">
                <label>
                  Workload
                  <select value={selectedWorkloadId} onChange={(event) => setSelectedWorkloadId(event.target.value)}>
                    {workloads.map((workload) => (
                      <option key={workload.id} value={workload.id}>
                        {workload.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Language
                  <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
                    {languages.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <article className="workload-summary">
                <div>
                  <span className="pill">{selectedWorkload.difficulty}</span>
                  <h3>{selectedWorkload.title}</h3>
                </div>
                <p>{selectedWorkload.prompt}</p>
              </article>

              <label className="editor-label">
                Implementation
                <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} />
              </label>

              <button className="primary-button" disabled={submitting} type="submit">
                {submitting ? "Analyzing..." : "Run analysis"}
              </button>
            </form>
          ) : (
            <p>No workloads available.</p>
          )}
        </section>

        <section className="panel panel-results">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Analyzer Output</p>
              <h2>Results and report</h2>
            </div>
          </div>

          {result ? (
            <div className="results-grid">
              <article className="result-summary">
                <h3>Summary</h3>
                <p>{result.summary}</p>
                <ul className="plain-list">
                  {result.serviceNotes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </article>

              <article className="result-tests">
                <h3>Checks</h3>
                {result.tests.map((test) => (
                  <div className="test-row" key={test.name}>
                    <div>
                      <strong>{test.name}</strong>
                      <p>{test.detail}</p>
                    </div>
                    <span className={`test-status test-${test.status}`}>{test.status}</span>
                  </div>
                ))}
              </article>

              <article className="result-report">
                <h3>Ruby report output</h3>
                <pre>{result.reportMarkdown}</pre>
              </article>
            </div>
          ) : (
            <p className="empty-state">Run an analysis to populate the pipeline and generate a final report.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

import { FormEvent, Suspense, lazy, useEffect, useState } from "react";
import { evaluateSubmission, fetchChallenges } from "./lib/api";
import { Challenge, EvaluationResult, Language, PipelineStage } from "./types";

const PipelineCanvas = lazy(() =>
  import("./components/PipelineCanvas").then((module) => ({ default: module.PipelineCanvas }))
);

const languages: Language[] = ["python", "javascript", "typescript", "java", "ruby"];

const idlePipeline: PipelineStage[] = [
  { id: "submission", label: "Submission", status: "idle" },
  { id: "tests", label: "Tests", status: "idle" },
  { id: "score", label: "Score", status: "idle" },
  { id: "feedback", label: "Feedback", status: "idle" }
];

function App() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [selectedChallengeId, setSelectedChallengeId] = useState("");
  const [language, setLanguage] = useState<Language>("typescript");
  const [code, setCode] = useState("");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [pipeline, setPipeline] = useState<PipelineStage[]>(idlePipeline);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadChallenges() {
      const nextChallenges = await fetchChallenges();
      setChallenges(nextChallenges);
      setSelectedChallengeId(nextChallenges[0]?.id ?? "");
      setLoading(false);
    }

    void loadChallenges();
  }, []);

  const selectedChallenge = challenges.find((challenge) => challenge.id === selectedChallengeId);

  useEffect(() => {
    if (!selectedChallenge) {
      return;
    }

    setCode(selectedChallenge.starterCode[language]);
    setResult(null);
    setPipeline(idlePipeline);
  }, [selectedChallengeId, language, selectedChallenge]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedChallenge) {
      return;
    }

    setSubmitting(true);
    setPipeline([
      { id: "submission", label: "Submission", status: "success" },
      { id: "tests", label: "Tests", status: "running" },
      { id: "score", label: "Score", status: "idle" },
      { id: "feedback", label: "Feedback", status: "idle" }
    ]);

    const evaluation = await evaluateSubmission(selectedChallenge.id, selectedChallenge.title, language, code);
    setResult(evaluation);
    setPipeline(evaluation.pipeline);
    setSubmitting(false);
  }

  return (
    <div className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Polyglot AI Training Portfolio</p>
          <h1>AI Coding Trainer 3D</h1>
          <p className="hero-copy">
            Evaluate multi-language challenge solutions and watch the pipeline move through tests, scoring, and feedback in a custom Three.js scene.
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
              <p className="panel-kicker">3D Evaluation Graph</p>
              <h2>Pipeline telemetry</h2>
            </div>
            <span className={`score-chip ${result ? "score-chip-live" : ""}`}>
              {result ? `${result.score}/100` : "waiting"}
            </span>
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
              <p className="panel-kicker">Challenge Workbench</p>
              <h2>Write and score a solution</h2>
            </div>
          </div>

          {loading ? (
            <p>Loading challenge library...</p>
          ) : selectedChallenge ? (
            <form className="workbench-form" onSubmit={handleSubmit}>
              <div className="control-row">
                <label>
                  Challenge
                  <select value={selectedChallengeId} onChange={(event) => setSelectedChallengeId(event.target.value)}>
                    {challenges.map((challenge) => (
                      <option key={challenge.id} value={challenge.id}>
                        {challenge.title}
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

              <article className="challenge-summary">
                <div>
                  <span className="pill">{selectedChallenge.difficulty}</span>
                  <h3>{selectedChallenge.title}</h3>
                </div>
                <p>{selectedChallenge.prompt}</p>
              </article>

              <label className="editor-label">
                Submission
                <textarea value={code} onChange={(event) => setCode(event.target.value)} spellCheck={false} />
              </label>

              <button className="primary-button" disabled={submitting} type="submit">
                {submitting ? "Evaluating..." : "Run evaluation"}
              </button>
            </form>
          ) : (
            <p>No challenges available.</p>
          )}
        </section>

        <section className="panel panel-results">
          <div className="panel-header">
            <div>
              <p className="panel-kicker">Evaluator Output</p>
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
            <p className="empty-state">Run a submission to populate the scoring pipeline and generate a final report.</p>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;

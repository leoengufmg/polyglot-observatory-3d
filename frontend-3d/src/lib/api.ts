import { AnalysisResult, Language, Workload } from "../types";
import { buildMockAnalysis, mockWorkloads } from "./mock";

const API_BASE = import.meta.env.VITE_ANALYZER_API ?? "http://localhost:8000";

export async function fetchWorkloads(): Promise<Workload[]> {
  try {
    const response = await fetch(`${API_BASE}/workloads`);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    return (await response.json()) as Workload[];
  } catch (error) {
    console.warn("Using mock workloads because the analyzer API is unavailable.", error);
    return mockWorkloads;
  }
}

export async function analyzeImplementation(
  workloadId: string,
  workloadTitle: string,
  language: Language,
  code: string
): Promise<AnalysisResult> {
  try {
    const response = await fetch(`${API_BASE}/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        workload_id: workloadId,
        language,
        code
      })
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    return (await response.json()) as AnalysisResult;
  } catch (error) {
    console.warn("Using mock analysis because the analyzer API is unavailable.", error);
    return buildMockAnalysis(language, workloadTitle);
  }
}

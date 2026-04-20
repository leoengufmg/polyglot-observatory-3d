import { Challenge, EvaluationResult, Language } from "../types";
import { buildMockEvaluation, mockChallenges } from "./mock";

const API_BASE = import.meta.env.VITE_EVALUATOR_API ?? "http://localhost:8000";

export async function fetchChallenges(): Promise<Challenge[]> {
  try {
    const response = await fetch(`${API_BASE}/challenges`);
    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    return (await response.json()) as Challenge[];
  } catch (error) {
    console.warn("Using mock challenges because the evaluator API is unavailable.", error);
    return mockChallenges;
  }
}

export async function evaluateSubmission(
  challengeId: string,
  challengeTitle: string,
  language: Language,
  code: string
): Promise<EvaluationResult> {
  try {
    const response = await fetch(`${API_BASE}/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        challenge_id: challengeId,
        language,
        code
      })
    });

    if (!response.ok) {
      throw new Error(`Unexpected status ${response.status}`);
    }

    return (await response.json()) as EvaluationResult;
  } catch (error) {
    console.warn("Using mock evaluation because the evaluator API is unavailable.", error);
    return buildMockEvaluation(language, challengeTitle);
  }
}


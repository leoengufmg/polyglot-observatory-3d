export type Language = "python" | "javascript" | "typescript" | "java" | "ruby";

export type TestStatus = "pass" | "warn" | "fail";
export type StageStatus = "idle" | "running" | "success" | "error";

export interface Challenge {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  prompt: string;
  starterCode: Record<Language, string>;
}

export interface TestResult {
  name: string;
  status: TestStatus;
  detail: string;
}

export interface PipelineStage {
  id: string;
  label: string;
  status: StageStatus;
}

export interface EvaluationResult {
  score: number;
  summary: string;
  tests: TestResult[];
  pipeline: PipelineStage[];
  reportMarkdown: string;
  serviceNotes: string[];
}


export type Language = "python" | "javascript" | "typescript" | "java" | "ruby";

export type TestStatus = "pass" | "warn" | "fail";
export type StageStatus = "idle" | "running" | "success" | "error";

export interface Workload {
  id: string;
  title: string;
  difficulty: string;
  description: string;
  prompt: string;
  sampleCode: Record<Language, string>;
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

export interface AnalysisResult {
  score: number;
  summary: string;
  tests: TestResult[];
  pipeline: PipelineStage[];
  reportMarkdown: string;
  serviceNotes: string[];
}

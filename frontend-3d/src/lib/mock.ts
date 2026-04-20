import { AnalysisResult, Language, Workload } from "../types";

export const mockWorkloads: Workload[] = [
  {
    id: "divisibility-map",
    title: "Divisibility Map",
    difficulty: "Intro",
    description: "Generate a labeled sequence that maps divisibility rules into readable tags.",
    prompt:
      "Build a function that produces a sequence from 1 to n. Multiples of 3 become Fizz, multiples of 5 become Buzz, and multiples of both become FizzBuzz.",
    sampleCode: {
      python:
        "def divisibility_map(n: int) -> list[str]:\n    result = []\n    for value in range(1, n + 1):\n        if value % 15 == 0:\n            result.append('FizzBuzz')\n        elif value % 3 == 0:\n            result.append('Fizz')\n        elif value % 5 == 0:\n            result.append('Buzz')\n        else:\n            result.append(str(value))\n    return result\n",
      javascript:
        "function divisibilityMap(n) {\n  const result = [];\n  for (let value = 1; value <= n; value += 1) {\n    if (value % 15 === 0) {\n      result.push('FizzBuzz');\n    } else if (value % 3 === 0) {\n      result.push('Fizz');\n    } else if (value % 5 === 0) {\n      result.push('Buzz');\n    } else {\n      result.push(String(value));\n    }\n  }\n  return result;\n}\n",
      typescript:
        "export function divisibilityMap(n: number): string[] {\n  const result: string[] = [];\n  for (let value = 1; value <= n; value += 1) {\n    if (value % 15 === 0) {\n      result.push('FizzBuzz');\n    } else if (value % 3 === 0) {\n      result.push('Fizz');\n    } else if (value % 5 === 0) {\n      result.push('Buzz');\n    } else {\n      result.push(String(value));\n    }\n  }\n  return result;\n}\n",
      java:
        "import java.util.ArrayList;\nimport java.util.List;\n\npublic class DivisibilityMap {\n    public static List<String> divisibilityMap(int n) {\n        List<String> result = new ArrayList<>();\n        for (int value = 1; value <= n; value++) {\n            if (value % 15 == 0) {\n                result.add(\"FizzBuzz\");\n            } else if (value % 3 == 0) {\n                result.add(\"Fizz\");\n            } else if (value % 5 == 0) {\n                result.add(\"Buzz\");\n            } else {\n                result.add(String.valueOf(value));\n            }\n        }\n        return result;\n    }\n}\n",
      ruby:
        "def divisibility_map(n)\n  result = []\n  (1..n).each do |value|\n    if value % 15 == 0\n      result << 'FizzBuzz'\n    elsif value % 3 == 0\n      result << 'Fizz'\n    elsif value % 5 == 0\n      result << 'Buzz'\n    else\n      result << value.to_s\n    end\n  end\n  result\nend\n"
    }
  },
  {
    id: "symmetry-scan",
    title: "Symmetry Scan",
    difficulty: "Core",
    description: "Normalize a string and determine whether its structure is symmetric.",
    prompt: "Build a function that returns true when a string is symmetric after removing case differences and non-alphanumeric characters.",
    sampleCode: {
      python:
        "def symmetry_scan(text: str) -> bool:\n    normalized = ''.join(ch.lower() for ch in text if ch.isalnum())\n    return normalized == normalized[::-1]\n",
      javascript:
        "function symmetryScan(text) {\n  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return normalized === normalized.split('').reverse().join('');\n}\n",
      typescript:
        "export function symmetryScan(text: string): boolean {\n  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return normalized === normalized.split('').reverse().join('');\n}\n",
      java:
        "public class SymmetryScan {\n    public static boolean symmetryScan(String text) {\n        String normalized = text.toLowerCase().replaceAll(\"[^a-z0-9]\", \"\");\n        String reversed = new StringBuilder(normalized).reverse().toString();\n        return normalized.equals(reversed);\n    }\n}\n",
      ruby:
        "def symmetry_scan(text)\n  normalized = text.downcase.gsub(/[^a-z0-9]/, '')\n  normalized == normalized.reverse\nend\n"
    }
  }
];

const mockScoreByLanguage: Record<Language, number> = {
  python: 91,
  javascript: 84,
  typescript: 88,
  java: 86,
  ruby: 82
};

export function buildMockAnalysis(language: Language, workloadTitle: string): AnalysisResult {
  const score = mockScoreByLanguage[language];

  return {
    score,
    summary: `${language.toUpperCase()} implementation analyzed for ${workloadTitle}. The pipeline identified clear control flow and consistent implementation signals.`,
    tests: [
      {
        name: "Signature signal",
        status: "pass",
        detail: "Expected entrypoint was found."
      },
      {
        name: "Control flow signal",
        status: score >= 85 ? "pass" : "warn",
        detail: "Branching logic was detected and can be extended with more edge handling."
      },
      {
        name: "Output shape",
        status: "pass",
        detail: "The implementation builds and returns the expected structure."
      }
    ],
    pipeline: [
      { id: "ingest", label: "Ingest", status: "success" },
      { id: "checks", label: "Checks", status: score >= 85 ? "success" : "running" },
      { id: "benchmark", label: "Benchmark", status: "success" },
      { id: "report", label: "Report", status: "success" }
    ],
    reportMarkdown: `# ${workloadTitle}\n\nLanguage: ${language}\nScore: ${score}\n\nThe mock fallback is active because the analyzer API is not reachable.\n`,
    serviceNotes: ["Frontend fallback was used.", "Three.js scene still reflects the final pipeline state."]
  };
}

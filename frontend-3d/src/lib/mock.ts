import { Challenge, EvaluationResult, Language } from "../types";

export const mockChallenges: Challenge[] = [
  {
    id: "fizzbuzz",
    title: "FizzBuzz Feedback Loop",
    difficulty: "Easy",
    description: "Return the FizzBuzz sequence from 1 to n as a list-like collection of strings.",
    prompt:
      "Write a function that returns the sequence from 1 to n. Multiples of 3 become Fizz, multiples of 5 become Buzz, and multiples of both become FizzBuzz.",
    starterCode: {
      python:
        "def fizzbuzz(n: int) -> list[str]:\n    result = []\n    for value in range(1, n + 1):\n        if value % 15 == 0:\n            result.append('FizzBuzz')\n        elif value % 3 == 0:\n            result.append('Fizz')\n        elif value % 5 == 0:\n            result.append('Buzz')\n        else:\n            result.append(str(value))\n    return result\n",
      javascript:
        "function fizzbuzz(n) {\n  const result = [];\n  for (let value = 1; value <= n; value += 1) {\n    if (value % 15 === 0) {\n      result.push('FizzBuzz');\n    } else if (value % 3 === 0) {\n      result.push('Fizz');\n    } else if (value % 5 === 0) {\n      result.push('Buzz');\n    } else {\n      result.push(String(value));\n    }\n  }\n  return result;\n}\n",
      typescript:
        "export function fizzbuzz(n: number): string[] {\n  const result: string[] = [];\n  for (let value = 1; value <= n; value += 1) {\n    if (value % 15 === 0) {\n      result.push('FizzBuzz');\n    } else if (value % 3 === 0) {\n      result.push('Fizz');\n    } else if (value % 5 === 0) {\n      result.push('Buzz');\n    } else {\n      result.push(String(value));\n    }\n  }\n  return result;\n}\n",
      java:
        "import java.util.ArrayList;\nimport java.util.List;\n\npublic class FizzBuzz {\n    public static List<String> fizzbuzz(int n) {\n        List<String> result = new ArrayList<>();\n        for (int value = 1; value <= n; value++) {\n            if (value % 15 == 0) {\n                result.add(\"FizzBuzz\");\n            } else if (value % 3 == 0) {\n                result.add(\"Fizz\");\n            } else if (value % 5 == 0) {\n                result.add(\"Buzz\");\n            } else {\n                result.add(String.valueOf(value));\n            }\n        }\n        return result;\n    }\n}\n",
      ruby:
        "def fizzbuzz(n)\n  result = []\n  (1..n).each do |value|\n    if value % 15 == 0\n      result << 'FizzBuzz'\n    elsif value % 3 == 0\n      result << 'Fizz'\n    elsif value % 5 == 0\n      result << 'Buzz'\n    else\n      result << value.to_s\n    end\n  end\n  result\nend\n"
    }
  },
  {
    id: "palindrome",
    title: "Palindrome Signal Check",
    difficulty: "Medium",
    description: "Check whether a normalized string reads the same forward and backward.",
    prompt: "Write a function that returns true when a string is a palindrome. Ignore case and non-alphanumeric characters.",
    starterCode: {
      python:
        "def is_palindrome(text: str) -> bool:\n    normalized = ''.join(ch.lower() for ch in text if ch.isalnum())\n    return normalized == normalized[::-1]\n",
      javascript:
        "function isPalindrome(text) {\n  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return normalized === normalized.split('').reverse().join('');\n}\n",
      typescript:
        "export function isPalindrome(text: string): boolean {\n  const normalized = text.toLowerCase().replace(/[^a-z0-9]/g, '');\n  return normalized === normalized.split('').reverse().join('');\n}\n",
      java:
        "public class PalindromeChecker {\n    public static boolean isPalindrome(String text) {\n        String normalized = text.toLowerCase().replaceAll(\"[^a-z0-9]\", \"\");\n        String reversed = new StringBuilder(normalized).reverse().toString();\n        return normalized.equals(reversed);\n    }\n}\n",
      ruby:
        "def palindrome?(text)\n  normalized = text.downcase.gsub(/[^a-z0-9]/, '')\n  normalized == normalized.reverse\nend\n"
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

export function buildMockEvaluation(language: Language, challengeTitle: string): EvaluationResult {
  const score = mockScoreByLanguage[language];

  return {
    score,
    summary: `${language.toUpperCase()} solution evaluated for ${challengeTitle}. The pipeline identified strong control flow and challenge coverage.`,
    tests: [
      {
        name: "Signature detection",
        status: "pass",
        detail: "Expected entrypoint was found."
      },
      {
        name: "Control flow coverage",
        status: score >= 85 ? "pass" : "warn",
        detail: "Branching logic was detected, but edge cases can be expanded."
      },
      {
        name: "Collection assembly",
        status: "pass",
        detail: "The solution builds and returns the expected structure."
      }
    ],
    pipeline: [
      { id: "submission", label: "Submission", status: "success" },
      { id: "tests", label: "Tests", status: score >= 85 ? "success" : "running" },
      { id: "score", label: "Score", status: "success" },
      { id: "feedback", label: "Feedback", status: "success" }
    ],
    reportMarkdown: `# ${challengeTitle}\n\nLanguage: ${language}\nScore: ${score}\n\nThe mock fallback is active because the evaluator API is not reachable.\n`,
    serviceNotes: [
      "Frontend fallback was used.",
      "Three.js scene still reflects the final pipeline state."
    ]
  };
}


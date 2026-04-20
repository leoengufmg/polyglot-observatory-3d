const widgetRoot = document.getElementById("widget-root");

const starters = {
  javascript: `function divisibilityMap(n) {
  const result = [];
  for (let value = 1; value <= n; value += 1) {
    if (value % 15 === 0) {
      result.push("FizzBuzz");
    } else if (value % 3 === 0) {
      result.push("Fizz");
    } else if (value % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(String(value));
    }
  }
  return result;
}`,
  typescript: `export function divisibilityMap(n: number): string[] {
  const result: string[] = [];
  for (let value = 1; value <= n; value += 1) {
    if (value % 15 === 0) {
      result.push("FizzBuzz");
    } else if (value % 3 === 0) {
      result.push("Fizz");
    } else if (value % 5 === 0) {
      result.push("Buzz");
    } else {
      result.push(String(value));
    }
  }
  return result;
}`
};

widgetRoot.innerHTML = `
  <section class="widget-grid">
    <label>
      Language
      <select id="language-select">
        <option value="javascript">javascript</option>
        <option value="typescript">typescript</option>
      </select>
    </label>
    <label>
      Implementation
      <textarea id="code-input" spellcheck="false">${starters.javascript}</textarea>
    </label>
    <button id="score-button" type="button">Simulate quick scan</button>
    <article class="widget-score">
      <span class="widget-score-label">Scan score</span>
      <strong id="widget-score-value">--</strong>
      <p id="widget-score-detail">Choose a language and run a lightweight frontend-only scan.</p>
    </article>
  </section>
`;

const languageSelect = document.getElementById("language-select");
const codeInput = document.getElementById("code-input");
const scoreButton = document.getElementById("score-button");
const scoreValue = document.getElementById("widget-score-value");
const scoreDetail = document.getElementById("widget-score-detail");

languageSelect.addEventListener("change", (event) => {
  const nextLanguage = event.target.value;
  codeInput.value = starters[nextLanguage];
  scoreValue.textContent = "--";
  scoreDetail.textContent = "Starter code updated for the selected language.";
});

scoreButton.addEventListener("click", () => {
  const code = codeInput.value.toLowerCase();
  const checks = ["function", "for", "if", "return"].filter((token) => code.includes(token));
  const score = 40 + checks.length * 15;
  scoreValue.textContent = `${Math.min(score, 100)}/100`;
  scoreDetail.textContent = `Detected ${checks.length} implementation signals: ${checks.join(", ") || "none"}.`;
});

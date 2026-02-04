"use strict";
(() => {
  // src/webview/views/simple.ts
  var vscode = acquireVsCodeApi();
  var currentResult = null;
  function post(type, payload) {
    vscode.postMessage({ type, id: genId(), timestamp: Date.now(), payload });
  }
  function genId() {
    return `id_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  function getLanguageName(code) {
    const names = { zh: "\u4E2D\u6587", en: "English", ja: "\u65E5\u672C\u8A9E", auto: "\u81EA\u52A8" };
    return names[code] || code;
  }
  function formatDuration(ms) {
    if (!Number.isFinite(ms)) return "";
    if (ms < 1e3) return `${Math.round(ms)}ms`;
    return `${(ms / 1e3).toFixed(2)}s`;
  }
  function renderResult(result) {
    const app = document.getElementById("app");
    if (!app) return;
    if (!result) {
      app.innerHTML = `<p style="color: var(--vscode-descriptionForeground);">\u6682\u65E0\u7FFB\u8BD1\u7ED3\u679C</p>`;
      return;
    }
    const translation = String(result.translation || "");
    const pronunciation = String(result.pronunciation || "");
    const alternatives = Array.isArray(result.alternatives) ? result.alternatives : [];
    const meta = result.meta || {};
    const lang = meta.sourceLang && meta.targetLang ? `${getLanguageName(meta.sourceLang)} \u2192 ${getLanguageName(meta.targetLang)}` : "";
    app.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px;">
      <div style="font-size: 14px; line-height: 1.6;">${escapeHtml(translation)}</div>
      ${pronunciation ? `<div style="font-style: italic; color: var(--vscode-textLink-foreground);">${escapeHtml(pronunciation)}</div>` : ""}

      ${lang || meta.provider || meta.duration ? `
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); display:flex; gap:10px; flex-wrap: wrap;">
          ${lang ? `<span>${escapeHtml(lang)}</span>` : ""}
          ${meta.provider ? `<span>${escapeHtml(String(meta.provider))}</span>` : ""}
          ${meta.duration ? `<span>${escapeHtml(formatDuration(Number(meta.duration)))}</span>` : ""}
        </div>
      ` : ""}

      <div style="display:flex; gap:8px;">
        <button class="action-copy" style="flex:1;">\u590D\u5236</button>
        <button class="action-expand" style="flex:1;">\u8BE6\u60C5</button>
        <button class="action-replace" style="flex:1;">\u66FF\u6362</button>
      </div>

      ${alternatives.length ? `
        <div style="border-top:1px solid var(--vscode-panel-border); padding-top:8px;">
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">\u5176\u4ED6\u7FFB\u8BD1</div>
          <div style="display:flex; flex-direction:column; gap:4px;">
            ${alternatives.map((alt, i) => `<div class="alternative-item" data-index="${i}" style="cursor:pointer; padding:4px 0;">${escapeHtml(String(alt))}</div>`).join("")}
          </div>
        </div>
      ` : ""}
    </div>
  `;
  }
  function showProgress(message) {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `<p style="color: var(--vscode-descriptionForeground);">${escapeHtml(message || "\u6B63\u5728\u7FFB\u8BD1...")}</p>`;
  }
  function showError(error) {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = `<p style="color: var(--vscode-errorForeground);">${escapeHtml(error)}</p>`;
  }
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (!message || !message.type) return;
    if (message.type === "translate.result") {
      currentResult = message.payload?.result;
      renderResult(currentResult);
    } else if (message.type === "translate.progress") {
      showProgress(message.payload?.message);
    } else if (message.type === "translate.error") {
      showError(String(message.payload?.error || "\u7FFB\u8BD1\u5931\u8D25"));
    }
  });
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (!target) return;
    if (target.classList.contains("action-copy")) {
      post("action.copy");
    } else if (target.classList.contains("action-expand")) {
      post("action.expand");
    } else if (target.classList.contains("action-replace")) {
      post("action.replace");
    } else if (target.classList.contains("alternative-item")) {
      const index = Number(target.getAttribute("data-index"));
      if (Number.isFinite(index)) {
        post("action.selectAlternative", { index });
      }
    }
  });
  post("panel.focus");
  showProgress("\u7B49\u5F85\u7FFB\u8BD1\u7ED3\u679C...");
})();
//# sourceMappingURL=simple.js.map

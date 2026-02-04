"use strict";
(() => {
  // src/webview/views/full.ts
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
  function render() {
    const app = document.getElementById("app");
    if (!app) return;
    if (!currentResult) {
      app.innerHTML = `<p style="color: var(--vscode-descriptionForeground);">\u6682\u65E0\u7FFB\u8BD1\u7ED3\u679C</p>`;
      return;
    }
    const r = currentResult;
    const alternatives = Array.isArray(r.alternatives) ? r.alternatives : [];
    const explanations = Array.isArray(r.explanations) ? r.explanations : [];
    const examples = Array.isArray(r.examples) ? r.examples : [];
    app.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:14px;">
      <div>
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">\u539F\u6587</div>
        <div style="font-size: 13px; color: var(--vscode-descriptionForeground);">${escapeHtml(String(r.original || ""))}</div>
      </div>

      <div>
        <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">\u7FFB\u8BD1</div>
        <div style="font-size: 16px; line-height: 1.7; padding: 12px; border-left: 3px solid var(--vscode-button-primaryBackground); background: var(--vscode-textBlockQuote-background);">${escapeHtml(String(r.translation || ""))}</div>
        ${r.pronunciation ? `<div style="margin-top:8px; font-style: italic; color: var(--vscode-textLink-foreground);">${escapeHtml(String(r.pronunciation))}</div>` : ""}
      </div>

      ${alternatives.length ? `
        <div>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">\u5176\u4ED6\u7FFB\u8BD1</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${alternatives.map((alt, i) => `<div class="alternative-item" data-index="${i}" style="cursor:pointer; padding:8px; background: var(--vscode-editor-inactiveSelectionBackground);">${escapeHtml(String(alt))}</div>`).join("")}
          </div>
        </div>
      ` : ""}

      ${explanations.length ? `
        <div>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">\u8BCD\u6C47/\u91CA\u4E49</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${explanations.map((e) => `<div style="padding:8px; background: var(--vscode-editor-inactiveSelectionBackground);">
              <div style="font-weight:600;">${escapeHtml(String(e.word || ""))}</div>
              <div style="color: var(--vscode-descriptionForeground);">${escapeHtml(String(e.meaning || e.definition || ""))}</div>
            </div>`).join("")}
          </div>
        </div>
      ` : ""}

      ${examples.length ? `
        <div>
          <div style="font-size: 11px; color: var(--vscode-descriptionForeground); margin-bottom:6px;">\u4F8B\u53E5</div>
          <div style="display:flex; flex-direction:column; gap:6px;">
            ${examples.map((ex) => `<div style="padding:8px; background: var(--vscode-editor-inactiveSelectionBackground);">
              <div style="color: var(--vscode-descriptionForeground);">${escapeHtml(String(ex.original || ex.source || ""))}</div>
              <div>${escapeHtml(String(ex.translation || ex.target || ""))}</div>
            </div>`).join("")}
          </div>
        </div>
      ` : ""}

      <div style="display:flex; gap:8px;">
        <button class="action-copy" style="flex:1;">\u590D\u5236</button>
        <button class="action-replace" style="flex:1;">\u66FF\u6362</button>
        <button class="action-sendToSimple" style="flex:1;">\u56DE\u5230\u7B80\u7248</button>
      </div>
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
      render();
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
    } else if (target.classList.contains("action-replace")) {
      post("action.replace");
    } else if (target.classList.contains("action-sendToSimple")) {
      post("action.sendToSimple");
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
//# sourceMappingURL=full.js.map

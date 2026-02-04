"use strict";
(() => {
  // src/webview/views/settings.ts
  var vscode = acquireVsCodeApi();
  var pending = /* @__PURE__ */ new Map();
  function genId() {
    return `req_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }
  function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  function post(type, payload) {
    vscode.postMessage({ type, id: genId(), timestamp: Date.now(), payload });
  }
  function request(type, payload) {
    const id = genId();
    const message = { type, id, timestamp: Date.now(), payload };
    return new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Request timeout: ${type}`));
      }, 15e3);
      pending.set(id, { resolve, reject, timeout });
      vscode.postMessage(message);
    });
  }
  window.addEventListener("message", (event) => {
    const message = event.data;
    if (!message) return;
    if (message.id && Object.prototype.hasOwnProperty.call(message, "response")) {
      const p = pending.get(message.id);
      if (!p) return;
      window.clearTimeout(p.timeout);
      pending.delete(message.id);
      const resp = message.response;
      if (resp && typeof resp === "object" && "error" in resp) {
        p.reject(new Error(String(resp.error)));
      } else {
        p.resolve(resp);
      }
      return;
    }
  });
  async function loadConfiguration() {
    const config = await request("config.get");
    const defaultProvider = document.getElementById("default-provider");
    const displayMode = document.getElementById("display-mode");
    const targetLang = document.getElementById("target-lang");
    if (defaultProvider) defaultProvider.value = config?.defaultProvider || "deepseek";
    if (displayMode) displayMode.value = config?.displayMode || "simple";
    if (targetLang) targetLang.value = config?.defaultTargetLang || "zh";
    await loadProviders();
  }
  async function loadProviders() {
    const data = await request("config.providers.get");
    const providers = data?.providers ? Object.values(data.providers) : [];
    const providerList = document.getElementById("provider-list");
    if (!providerList) return;
    if (!providers.length) {
      providerList.innerHTML = '<p style="color: var(--vscode-descriptionForeground);">\u6682\u65E0\u914D\u7F6E\u7684\u670D\u52A1\u5546</p>';
      return;
    }
    providerList.innerHTML = providers.map((p) => {
      const configured = !!p.apiKey;
      return `
      <div style="padding: 12px; background: var(--vscode-editor-inactiveSelectionBackground); border-radius: 4px;">
        <div style="font-weight: 600; margin-bottom: 8px;">
          <span style="display:inline-block; width:8px; height:8px; border-radius:50%; margin-right:8px; background:${configured ? "var(--vscode-testing-iconPassed)" : "var(--vscode-testing-iconFailed)"};"></span>
          ${escapeHtml(String(p.name || p.id))}
        </div>

        <div style="display:flex; flex-direction:column; gap:10px;">
          <div>
            <label style="display:block; margin-bottom:6px;">API Key</label>
            <input type="password" id="apiKey-${escapeHtml(String(p.id))}" value="${escapeHtml(String(p.apiKey || ""))}" placeholder="\u8F93\u5165 API Key" style="width:100%;" />
          </div>

          <div>
            <label style="display:block; margin-bottom:6px;">Base URL</label>
            <input type="text" id="endpoint-${escapeHtml(String(p.id))}" value="${escapeHtml(String(p.apiEndpoint || p.baseUrl || ""))}" placeholder="https://api.example.com" style="width:100%;" />
          </div>

          <div>
            <label style="display:block; margin-bottom:6px;">\u6A21\u578B</label>
            <input type="text" id="model-${escapeHtml(String(p.id))}" value="${escapeHtml(String(p.model || ""))}" placeholder="model" style="width:100%;" />
          </div>

          <button class="btn-save-provider" data-provider-id="${escapeHtml(String(p.id))}">\u4FDD\u5B58</button>
        </div>
      </div>
    `;
    }).join("");
  }
  async function saveGeneralSettings() {
    const defaultProvider = document.getElementById("default-provider")?.value;
    const displayMode = document.getElementById("display-mode")?.value;
    const targetLang = document.getElementById("target-lang")?.value;
    await request("config.update", { key: "defaultProvider", value: defaultProvider });
    await request("config.update", { key: "displayMode", value: displayMode });
    await request("config.update", { key: "defaultTargetLang", value: targetLang });
    post("notification.show", { message: "\u8BBE\u7F6E\u5DF2\u4FDD\u5B58", type: "info" });
  }
  async function saveProviderConfig(providerId) {
    const apiKey = document.getElementById(`apiKey-${providerId}`)?.value || "";
    const apiEndpoint = document.getElementById(`endpoint-${providerId}`)?.value || "";
    const model = document.getElementById(`model-${providerId}`)?.value || "";
    await request("config.providers.update", {
      providerId,
      config: {
        apiKey,
        apiEndpoint,
        model
      }
    });
    post("notification.show", { message: "\u670D\u52A1\u5546\u914D\u7F6E\u5DF2\u4FDD\u5B58", type: "info" });
    await loadProviders();
  }
  function switchTab(tabName) {
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.classList.toggle("active", tab.dataset.tab === tabName);
    });
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.getElementById(`tab-${tabName}`)?.classList.add("active");
  }
  function init() {
    document.addEventListener("click", async (e) => {
      const target = e.target;
      if (!target) return;
      if (target.classList.contains("tab")) {
        const tabName = target.dataset.tab;
        if (tabName) switchTab(tabName);
        return;
      }
      if (target.id === "save-general") {
        try {
          await saveGeneralSettings();
        } catch (err) {
          post("notification.show", { message: err.message || "\u4FDD\u5B58\u5931\u8D25", type: "error" });
        }
        return;
      }
      if (target.classList.contains("btn-save-provider")) {
        const providerId = target.getAttribute("data-provider-id");
        if (!providerId) return;
        try {
          await saveProviderConfig(providerId);
        } catch (err) {
          post("notification.show", { message: err.message || "\u4FDD\u5B58\u5931\u8D25", type: "error" });
        }
        return;
      }
      if (target.id === "add-template") {
        post("notification.show", { message: "\u6A21\u677F\u7F16\u8F91\u529F\u80FD\u5F00\u53D1\u4E2D...", type: "info" });
        return;
      }
      if (target.id === "add-provider") {
        post("notification.show", { message: "\u8BF7\u901A\u8FC7\u5185\u7F6E\u670D\u52A1\u5546\u914D\u7F6E\u9879\u8FDB\u884C\u914D\u7F6E", type: "info" });
        return;
      }
    });
    loadConfiguration().catch((err) => {
      post("notification.show", { message: err?.message || "\u52A0\u8F7D\u914D\u7F6E\u5931\u8D25", type: "error" });
    });
    post("panel.focus");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
//# sourceMappingURL=settings.js.map

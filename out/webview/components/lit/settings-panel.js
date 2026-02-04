"use strict";
/**
 * 设置面板组件
 * 用于显示插件设置的 Lit Web Component
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPanelComponent = void 0;
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
// ============================================================================
// 设置面板组件
// ============================================================================
let SettingsPanelComponent = class SettingsPanelComponent extends lit_1.LitElement {
    constructor() {
        super(...arguments);
        // 组件属性
        this.activeTab = 'general';
        this.isSaving = false;
    }
    /**
     * 渲染标签页
     */
    renderTabs() {
        return (0, lit_1.html) `
      <div class="tabs">
        <button
          class="tab ${this.activeTab === 'general' ? 'active' : ''}"
          @click="${() => this.setActiveTab('general')}"
        >
          常规
        </button>
        <button
          class="tab ${this.activeTab === 'providers' ? 'active' : ''}"
          @click="${() => this.setActiveTab('providers')}"
        >
          服务商
        </button>
        <button
          class="tab ${this.activeTab === 'templates' ? 'active' : ''}"
          @click="${() => this.setActiveTab('templates')}"
        >
          模板
        </button>
      </div>
    `;
    }
    /**
     * 渲染常规设置
     */
    renderGeneralSettings() {
        return (0, lit_1.html) `
      <div class="tab-content ${this.activeTab === 'general' ? 'active' : ''}">
        <div class="form-group">
          <label for="default-provider">默认服务商</label>
          <select id="default-provider" @change="${this.onDefaultProviderChange}">
            <option value="">选择服务商...</option>
            ${this.providers?.map(p => (0, lit_1.html) `
              <option value="${p.id}" ?selected="${this.config?.defaultProvider === p.id}">
                ${p.name}
              </option>
            `)}
          </select>
          <div class="hint">选择默认使用的翻译服务商</div>
        </div>

        <div class="form-group">
          <label for="display-mode">显示模式</label>
          <select id="display-mode" @change="${this.onDisplayModeChange}">
            <option value="simple" ?selected="${this.config?.displayMode === 'simple'}">简单模式</option>
            <option value="normal" ?selected="${this.config?.displayMode === 'normal'}">完整模式</option>
          </select>
          <div class="hint">选择翻译结果的显示方式</div>
        </div>

        <div class="form-group">
          <label for="target-lang">默认目标语言</label>
          <select id="target-lang" @change="${this.onTargetLangChange}">
            <option value="zh" ?selected="${this.config?.defaultTargetLang === 'zh'}">中文</option>
            <option value="en" ?selected="${this.config?.defaultTargetLang === 'en'}">English</option>
            <option value="ja" ?selected="${this.config?.defaultTargetLang === 'ja'}">日本語</option>
          </select>
          <div class="hint">选择默认的翻译目标语言</div>
        </div>
      </div>
    `;
    }
    /**
     * 渲染服务商设置
     */
    renderProviderSettings() {
        return (0, lit_1.html) `
      <div class="tab-content ${this.activeTab === 'providers' ? 'active' : ''}">
        <div class="provider-list">
          ${this.providers?.map(provider => this.renderProviderItem(provider))}
        </div>
        ${this.providers && this.providers.length > 0 ? '' : (0, lit_1.html) `
          <div class="empty-state">暂无配置的服务商</div>
        `}
      </div>
    `;
    }
    /**
     * 渲染单个服务商
     */
    renderProviderItem(provider) {
        const isEditing = this.editingProvider === provider.id;
        const isActive = provider.apiKey ? true : false;
        return (0, lit_1.html) `
      <div class="provider-item">
        <div class="provider-header">
          <span class="provider-name">${provider.name}</span>
          <div class="provider-status">
            <span class="status-dot ${isActive ? 'active' : 'inactive'}"></span>
            <span>${isActive ? '已配置' : '未配置'}</span>
          </div>
        </div>

        ${isEditing ? this.renderProviderConfigForm(provider) : ''}

        <div class="provider-actions">
          ${isEditing ? (0, lit_1.html) `
            <button class="btn" @click="${() => this.saveProviderConfig(provider)}">保存</button>
            <button class="btn btn-secondary" @click="${() => this.editingProvider = undefined}">取消</button>
          ` : (0, lit_1.html) `
            <button class="btn" @click="${() => this.editingProvider = provider.id}">配置</button>
          `}
        </div>
      </div>
    `;
    }
    /**
     * 渲染服务商配置表单
     */
    renderProviderConfigForm(provider) {
        return (0, lit_1.html) `
      <div class="provider-config">
        <div class="form-group">
          <label>API Key</label>
          <input
            type="password"
            id="apiKey-${provider.id}"
            value="${provider.apiKey || ''}"
            placeholder="输入 API Key"
          />
        </div>

        ${provider.apiEndpoint ? (0, lit_1.html) `
          <div class="form-group">
            <label>API 端点</label>
            <input
              type="text"
              id="endpoint-${provider.id}"
              value="${provider.apiEndpoint || ''}"
              placeholder="https://api.example.com"
            />
          </div>
        ` : ''}

        ${provider.model ? (0, lit_1.html) `
          <div class="form-group">
            <label>模型</label>
            <input
              type="text"
              id="model-${provider.id}"
              value="${provider.model || ''}"
              placeholder="gpt-3.5-turbo"
            />
          </div>
        ` : ''}
      </div>
    `;
    }
    /**
     * 渲染模板设置
     */
    renderTemplateSettings() {
        return (0, lit_1.html) `
      <div class="tab-content ${this.activeTab === 'templates' ? 'active' : ''}">
        <div class="template-list">
          ${this.templates?.map(template => this.renderTemplateItem(template))}
        </div>
        <button class="btn" style="margin-top: 12px;" @click="${this.addTemplate}">
          + 添加模板
        </button>
      </div>
    `;
    }
    /**
     * 渲染单个模板
     */
    renderTemplateItem(template) {
        const isEditing = this.editingTemplate === template.id;
        return (0, lit_1.html) `
      <div class="template-item">
        <div class="template-header">
          <span class="template-name">${template.name}</span>
          <div class="provider-actions">
            ${isEditing ? (0, lit_1.html) `
              <button class="btn" @click="${() => this.saveTemplate(template)}">保存</button>
              <button class="btn btn-secondary" @click="${() => this.editingTemplate = undefined}">取消</button>
              <button class="btn btn-danger" @click="${() => this.deleteTemplate(template.id)}">删除</button>
            ` : (0, lit_1.html) `
              <button class="btn" @click="${() => this.editingTemplate = template.id}">编辑</button>
            `}
          </div>
        </div>

        ${isEditing ? this.renderTemplateForm(template) : (0, lit_1.html) `
          <div class="template-preview">${template.template}</div>
        `}
      </div>
    `;
    }
    /**
     * 渲染模板表单
     */
    renderTemplateForm(template) {
        return (0, lit_1.html) `
      <div class="form-group">
        <label>模板名称</label>
        <input
          type="text"
          id="templateName-${template.id}"
          value="${template.name}"
        />
      </div>

      <div class="form-group">
        <label>模板内容</label>
        <textarea
          id="templateContent-${template.id}"
          rows="4"
        >${template.template}</textarea>
        <div class="hint">可用变量: {text}, {sourceLang}, {targetLang}</div>
      </div>
    `;
    }
    /**
     * 设置活动标签页
     */
    setActiveTab(tab) {
        this.activeTab = tab;
        this.dispatchEvent(new CustomEvent('tab-change', { detail: { tab } }));
    }
    /**
     * 默认服务商变更
     */
    onDefaultProviderChange(e) {
        const target = e.target;
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { key: 'defaultProvider', value: target.value }
        }));
    }
    /**
     * 显示模式变更
     */
    onDisplayModeChange(e) {
        const target = e.target;
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { key: 'displayMode', value: target.value }
        }));
    }
    /**
     * 目标语言变更
     */
    onTargetLangChange(e) {
        const target = e.target;
        this.dispatchEvent(new CustomEvent('config-change', {
            detail: { key: 'defaultTargetLang', value: target.value }
        }));
    }
    /**
     * 保存服务商配置
     */
    saveProviderConfig(provider) {
        const apiKeyInput = this.shadowRoot?.getElementById(`apiKey-${provider.id}`);
        const endpointInput = this.shadowRoot?.getElementById(`endpoint-${provider.id}`);
        const modelInput = this.shadowRoot?.getElementById(`model-${provider.id}`);
        const config = {
            apiKey: apiKeyInput?.value || '',
        };
        if (endpointInput && provider.apiEndpoint) {
            config.apiEndpoint = endpointInput.value;
        }
        if (modelInput && provider.model) {
            config.model = modelInput.value;
        }
        this.dispatchEvent(new CustomEvent('provider-save', {
            detail: { providerId: provider.id, config }
        }));
        this.editingProvider = undefined;
    }
    /**
     * 添加模板
     */
    addTemplate() {
        this.dispatchEvent(new CustomEvent('template-add'));
    }
    /**
     * 保存模板
     */
    saveTemplate(template) {
        const nameInput = this.shadowRoot?.getElementById(`templateName-${template.id}`);
        const contentInput = this.shadowRoot?.getElementById(`templateContent-${template.id}`);
        this.dispatchEvent(new CustomEvent('template-save', {
            detail: {
                template: {
                    ...template,
                    name: nameInput?.value || template.name,
                    template: contentInput?.value || template.template,
                }
            }
        }));
        this.editingTemplate = undefined;
    }
    /**
     * 删除模板
     */
    deleteTemplate(templateId) {
        this.dispatchEvent(new CustomEvent('template-delete', {
            detail: { templateId }
        }));
    }
    /**
     * 渲染方法
     */
    render() {
        return (0, lit_1.html) `
      <div class="settings-panel">
        ${this.renderTabs()}
        ${this.renderGeneralSettings()}
        ${this.renderProviderSettings()}
        ${this.renderTemplateSettings()}
      </div>
    `;
    }
};
exports.SettingsPanelComponent = SettingsPanelComponent;
// 样式定义
SettingsPanelComponent.styles = (0, lit_1.css) `
    :host {
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
    }

    .settings-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .tabs {
      display: flex;
      gap: 4px;
      border-bottom: 1px solid var(--vscode-panel-border);
    }

    .tab {
      padding: 10px 16px;
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: var(--vscode-foreground);
      cursor: pointer;
      font-size: 13px;
      transition: all 0.2s;
    }

    .tab:hover {
      background: var(--vscode-toolbar-hoverBackground);
    }

    .tab.active {
      border-bottom-color: var(--vscode-button-primaryBackground);
    }

    .tab-content {
      display: none;
    }

    .tab-content.active {
      display: block;
    }

    .form-group {
      margin-bottom: 16px;
    }

    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-size: 13px;
      font-weight: 500;
    }

    .form-group input,
    .form-group select,
    .form-group textarea {
      width: 100%;
      padding: 8px 12px;
      background: var(--vscode-input-background);
      color: var(--vscode-input-foreground);
      border: 1px solid var(--vscode-input-border);
      border-radius: 2px;
      font-family: inherit;
      font-size: 13px;
    }

    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: 1px solid var(--vscode-focusBorder);
      outline-offset: -1px;
    }

    .form-group .hint {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-top: 4px;
    }

    .btn {
      padding: 8px 16px;
      background: var(--vscode-button-primaryBackground);
      color: var(--vscode-button-primaryForeground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 13px;
      transition: opacity 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn-danger {
      background: var(--vscode-errorBackground);
      color: var(--vscode-errorForeground);
    }

    .provider-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .provider-item {
      padding: 16px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
    }

    .provider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .provider-name {
      font-size: 14px;
      font-weight: 500;
    }

    .provider-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-dot.active {
      background: var(--vscode-testing-iconPassed);
    }

    .status-dot.inactive {
      background: var(--vscode-testing-iconFailed);
    }

    .provider-actions {
      display: flex;
      gap: 6px;
    }

    .provider-config {
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px solid var(--vscode-panel-border);
    }

    .template-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .template-item {
      padding: 16px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 4px;
    }

    .template-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .template-name {
      font-size: 14px;
      font-weight: 500;
    }

    .template-preview {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin: 8px 0;
      max-height: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-state {
      text-align: center;
      padding: 32px;
      color: var(--vscode-descriptionForeground);
    }

    .form-actions {
      display: flex;
      gap: 8px;
      margin-top: 16px;
    }
  `;
__decorate([
    (0, decorators_js_1.property)({ type: String })
], SettingsPanelComponent.prototype, "activeTab", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Object })
], SettingsPanelComponent.prototype, "config", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Array })
], SettingsPanelComponent.prototype, "providers", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Array })
], SettingsPanelComponent.prototype, "templates", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsPanelComponent.prototype, "editingProvider", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsPanelComponent.prototype, "editingTemplate", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsPanelComponent.prototype, "isSaving", void 0);
exports.SettingsPanelComponent = SettingsPanelComponent = __decorate([
    (0, decorators_js_1.customElement)('llm-settings-panel')
], SettingsPanelComponent);
//# sourceMappingURL=settings-panel.js.map
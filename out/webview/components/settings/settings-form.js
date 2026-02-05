"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsForm = void 0;
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
require("@vscode-elements/elements/dist/vscode-single-select");
require("@vscode-elements/elements/dist/vscode-button");
const base_element_1 = require("../common/base-element");
let SettingsForm = class SettingsForm extends base_element_1.BaseElement {
    constructor() {
        super(...arguments);
        this.isSaving = false;
        this.editedConfig = null;
    }
    willUpdate(changedProps) {
        if ((changedProps.has('config') || !this.editedConfig) && this.config) {
            this.editedConfig = { ...this.config };
        }
    }
    render() {
        if (!this.editedConfig)
            return (0, lit_1.html) ``;
        return (0, lit_1.html) `
      <div class="form-group">
        <label>默认服务商</label>
        <vscode-single-select
          .value="${this.editedConfig.defaultProvider}"
          @change="${this._handleProviderChange}"
        >
          <vscode-option value="deepseek">DeepSeek</vscode-option>
          <vscode-option value="qwen">千问 (Qwen)</vscode-option>
          <vscode-option value="kimi">Kimi</vscode-option>
          <vscode-option value="glm">智谱 GLM</vscode-option>
        </vscode-single-select>
      </div>

      <div class="form-group">
        <label>显示模式</label>
        <vscode-single-select
          .value="${this.editedConfig.displayMode}"
          @change="${this._handleDisplayModeChange}"
        >
          <vscode-option value="simple">简单模式</vscode-option>
          <vscode-option value="normal">完整模式</vscode-option>
        </vscode-single-select>
      </div>

      <div class="form-group">
        <label>默认目标语言</label>
        <vscode-single-select
          .value="${this.editedConfig.defaultTargetLang}"
          @change="${this._handleTargetLangChange}"
        >
          <vscode-option value="zh">中文</vscode-option>
          <vscode-option value="en">English</vscode-option>
          <vscode-option value="ja">日本語</vscode-option>
        </vscode-single-select>
      </div>

      <div class="actions">
        <vscode-button
          .disabled="${this.isSaving}"
          @click="${this._handleSave}"
        >
          ${this.isSaving ? '保存中...' : '保存设置'}
        </vscode-button>
      </div>
    `;
    }
    _handleProviderChange(e) {
        const target = e.target;
        if (this.editedConfig) {
            this.editedConfig = { ...this.editedConfig, defaultProvider: target.value };
        }
    }
    _handleDisplayModeChange(e) {
        const target = e.target;
        if (this.editedConfig) {
            this.editedConfig = { ...this.editedConfig, displayMode: target.value };
        }
    }
    _handleTargetLangChange(e) {
        const target = e.target;
        if (this.editedConfig) {
            this.editedConfig = { ...this.editedConfig, defaultTargetLang: target.value };
        }
    }
    async _handleSave() {
        if (!this.editedConfig)
            return;
        this.isSaving = true;
        this.dispatchEvent(new CustomEvent('save', {
            detail: this.editedConfig,
            bubbles: true,
            composed: true
        }));
        this.isSaving = false;
    }
};
exports.SettingsForm = SettingsForm;
SettingsForm.styles = [
    base_element_1.BaseElement.styles,
    (0, lit_1.css) `
      .form-group {
        margin-bottom: 20px;
      }

      label {
        display: block;
        margin-bottom: 6px;
        font-size: 13px;
        font-weight: 500;
      }

      vscode-single-select {
        width: 100%;
        max-width: 300px;
      }

      .actions {
        margin-top: 24px;
        padding-top: 16px;
        border-top: 1px solid var(--border);
      }
    `
];
__decorate([
    (0, decorators_js_1.property)({ type: Object })
], SettingsForm.prototype, "config", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsForm.prototype, "isSaving", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsForm.prototype, "editedConfig", void 0);
exports.SettingsForm = SettingsForm = __decorate([
    (0, decorators_js_1.customElement)('settings-form')
], SettingsForm);
//# sourceMappingURL=settings-form.js.map
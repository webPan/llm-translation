"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsPage = void 0;
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
require("@vscode-elements/elements/dist/vscode-tabs");
require("@vscode-elements/elements/dist/vscode-tab-header");
require("@vscode-elements/elements/dist/vscode-tab-panel");
const base_element_1 = require("../common/base-element");
require("./settings-form");
require("./provider-card");
require("./template-list");
let SettingsPage = class SettingsPage extends base_element_1.BaseElement {
    constructor() {
        super(...arguments);
        this.config = null;
        this.isLoading = true;
        this.error = null;
        this.templates = [];
        this.defaultTemplateId = 'default';
    }
    connectedCallback() {
        super.connectedCallback();
        this._loadConfig();
    }
    async _loadConfig() {
        try {
            this.dispatchEvent(new CustomEvent('load-config', {
                bubbles: true,
                composed: true
            }));
        }
        catch (err) {
            this.error = '加载配置失败';
            this.isLoading = false;
        }
    }
    setConfig(config) {
        this.config = config;
        this.isLoading = false;
    }
    setTemplates(templates, defaultId) {
        this.templates = templates;
        this.defaultTemplateId = defaultId;
    }
    render() {
        if (this.isLoading) {
            return (0, lit_1.html) `<div class="loading">加载中...</div>`;
        }
        if (this.error) {
            return (0, lit_1.html) `<div class="error">${this.error}</div>`;
        }
        if (!this.config) {
            return (0, lit_1.html) `<div class="empty">暂无配置</div>`;
        }
        const providers = Object.values(this.config.providers);
        return (0, lit_1.html) `
      <div class="header">
        <h1>设置</h1>
        <p>配置翻译插件的首选项和服务商</p>
      </div>

      <vscode-tabs>
        <vscode-tab-header slot="header">常规</vscode-tab-header>
        <vscode-tab-panel>
          <div class="tab-content">
            <settings-form
              .config="${this.config.general}"
              @save="${this._handleGeneralSave}"
            ></settings-form>
          </div>
        </vscode-tab-panel>

        <vscode-tab-header slot="header">服务商</vscode-tab-header>
        <vscode-tab-panel>
          <div class="tab-content">
            <div class="provider-list">
              ${providers.length === 0
            ? (0, lit_1.html) `<div class="empty">暂无配置的服务商</div>`
            : providers.map(provider => (0, lit_1.html) `
                    <provider-card
                      .provider="${provider}"
                      @save="${this._handleProviderSave}"
                    ></provider-card>
                  `)}
            </div>
          </div>
        </vscode-tab-panel>

        <vscode-tab-header slot="header">模板</vscode-tab-header>
        <vscode-tab-panel>
          <div class="tab-content">
            <template-list
              .templates="${this.templates}"
              .defaultTemplateId="${this.defaultTemplateId}"
              @save="${this._handleTemplateSave}"
              @delete="${this._handleTemplateDelete}"
              @set-default="${this._handleTemplateSetDefault}"
              @import="${this._handleTemplateImport}"
              @export="${this._handleTemplateExport}"
              @copy="${this._handleTemplateCopy}"
            ></template-list>
          </div>
        </vscode-tab-panel>
      </vscode-tabs>
    `;
    }
    _handleGeneralSave(e) {
        this.dispatchEvent(new CustomEvent('save-general', {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
    }
    _handleProviderSave(e) {
        this.dispatchEvent(new CustomEvent('save-provider', {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
    }
    _handleTemplateSave(e) {
        this.dispatchEvent(new CustomEvent('template-save', {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
    }
    _handleTemplateDelete(e) {
        this.dispatchEvent(new CustomEvent('template-delete', {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
    }
    _handleTemplateSetDefault(e) {
        this.dispatchEvent(new CustomEvent('template-set-default', {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
    }
    _handleTemplateImport() {
        this.dispatchEvent(new CustomEvent('template-import', {
            bubbles: true,
            composed: true
        }));
    }
    _handleTemplateExport() {
        this.dispatchEvent(new CustomEvent('template-export', {
            bubbles: true,
            composed: true
        }));
    }
    _handleTemplateCopy(e) {
        this.dispatchEvent(new CustomEvent('template-copy', {
            detail: e.detail,
            bubbles: true,
            composed: true
        }));
    }
};
exports.SettingsPage = SettingsPage;
SettingsPage.styles = [
    base_element_1.BaseElement.styles,
    (0, lit_1.css) `
      :host {
        display: block;
        max-width: 640px;
        margin: 0 auto;
        padding: 16px;
      }

      .header {
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .header h1 {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 4px 0;
        color: var(--vscode-foreground);
      }

      .header p {
        font-size: 12px;
        margin: 0;
        color: var(--vscode-descriptionForeground);
      }

      vscode-tabs {
        margin-top: 12px;
      }

      .tab-content {
        padding: 12px 0;
      }

      .provider-list {
        display: flex;
        flex-direction: column;
      }

      .provider-list > * {
        margin-bottom: 12px;
      }

      .provider-list > *:last-child {
        margin-bottom: 0;
      }

      .loading, .error, .empty {
        padding: 40px 16px;
        text-align: center;
        color: var(--vscode-descriptionForeground);
        font-size: 13px;
      }

      .error {
        color: var(--vscode-errorForeground);
      }
    `
];
__decorate([
    (0, decorators_js_1.state)()
], SettingsPage.prototype, "config", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsPage.prototype, "isLoading", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsPage.prototype, "error", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsPage.prototype, "templates", void 0);
__decorate([
    (0, decorators_js_1.state)()
], SettingsPage.prototype, "defaultTemplateId", void 0);
exports.SettingsPage = SettingsPage = __decorate([
    (0, decorators_js_1.customElement)('settings-page')
], SettingsPage);
//# sourceMappingURL=settings-page.js.map
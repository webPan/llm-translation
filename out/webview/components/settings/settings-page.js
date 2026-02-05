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
let SettingsPage = class SettingsPage extends base_element_1.BaseElement {
    constructor() {
        super(...arguments);
        this.config = null;
        this.isLoading = true;
        this.error = null;
    }
    connectedCallback() {
        super.connectedCallback();
        this._loadConfig();
    }
    async _loadConfig() {
        try {
            // 通过自定义事件让 View Entry 处理请求
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
    render() {
        if (this.isLoading) {
            return (0, lit_1.html) `
        <div class="loading">
          <p>加载中...</p>
        </div>
      `;
        }
        if (this.error) {
            return (0, lit_1.html) `
        <div class="error">
          <p>${this.error}</p>
        </div>
      `;
        }
        if (!this.config) {
            return (0, lit_1.html) `
        <div class="empty">
          <p>暂无配置</p>
        </div>
      `;
        }
        const providers = Object.values(this.config.providers);
        return (0, lit_1.html) `
      <div class="header">
        <h1>LLM Translation 设置</h1>
        <p>配置您的翻译插件</p>
      </div>

      <vscode-tabs>
        <vscode-tab-header slot="header">常规</vscode-tab-header>
        <vscode-tab-panel>
          <settings-form
            .config="${this.config.general}"
            @save="${this._handleGeneralSave}"
          ></settings-form>
        </vscode-tab-panel>

        <vscode-tab-header slot="header">服务商</vscode-tab-header>
        <vscode-tab-panel>
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
        </vscode-tab-panel>

        <vscode-tab-header slot="header">模板</vscode-tab-header>
        <vscode-tab-panel>
          <div class="empty">
            <p>模板编辑功能开发中...</p>
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
};
exports.SettingsPage = SettingsPage;
SettingsPage.styles = [
    base_element_1.BaseElement.styles,
    (0, lit_1.css) `
      :host {
        display: block;
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
      }

      .header {
        margin-bottom: 24px;
      }

      .header h1 {
        font-size: 24px;
        font-weight: 600;
        margin: 0 0 8px 0;
      }

      .header p {
        margin: 0;
        color: var(--description);
      }

      vscode-tabs {
        margin-top: 16px;
      }

      .provider-list {
        margin-top: 16px;
      }

      .loading {
        padding: 40px;
        text-align: center;
        color: var(--description);
      }

      .empty {
        padding: 24px;
        text-align: center;
        color: var(--description);
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
exports.SettingsPage = SettingsPage = __decorate([
    (0, decorators_js_1.customElement)('settings-page')
], SettingsPage);
//# sourceMappingURL=settings-page.js.map
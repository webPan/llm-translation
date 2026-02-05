"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderCard = void 0;
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
require("@vscode-elements/elements/dist/vscode-textfield");
require("@vscode-elements/elements/dist/vscode-button");
const base_element_1 = require("../common/base-element");
let ProviderCard = class ProviderCard extends base_element_1.BaseElement {
    constructor() {
        super(...arguments);
        this.isSaving = false;
        this.editedProvider = null;
    }
    willUpdate(changedProps) {
        if ((changedProps.has('provider') || !this.editedProvider) && this.provider) {
            this.editedProvider = { ...this.provider };
        }
    }
    render() {
        if (!this.editedProvider)
            return (0, lit_1.html) ``;
        return (0, lit_1.html) `
      <div class="card">
        <div class="card-header">
          <span class="card-title">${this.editedProvider.name}</span>
          <span class="status ${this.editedProvider.configured ? 'configured' : 'unconfigured'}">
            ${this.editedProvider.configured ? '已配置' : '未配置'}
          </span>
        </div>

        <div class="field">
          <label>API Key</label>
          <vscode-textfield
            type="password"
            .value="${this.editedProvider.apiKey}"
            placeholder="sk-..."
            @input="${this._handleApiKeyChange}"
          ></vscode-textfield>
        </div>

        <div class="field">
          <label>Base URL</label>
          <vscode-textfield
            .value="${this.editedProvider.baseUrl}"
            placeholder="https://..."
            @input="${this._handleBaseUrlChange}"
          ></vscode-textfield>
        </div>

        <div class="field">
          <label>模型</label>
          <vscode-textfield
            .value="${this.editedProvider.model}"
            placeholder="gpt-3.5-turbo"
            @input="${this._handleModelChange}"
          ></vscode-textfield>
        </div>

        <div class="actions">
          <vscode-button
            .disabled="${this.isSaving}"
            @click="${this._handleSave}"
          >
            保存
          </vscode-button>
        </div>
      </div>
    `;
    }
    _handleApiKeyChange(e) {
        const target = e.target;
        if (this.editedProvider) {
            this.editedProvider = { ...this.editedProvider, apiKey: target.value };
        }
    }
    _handleBaseUrlChange(e) {
        const target = e.target;
        if (this.editedProvider) {
            this.editedProvider = { ...this.editedProvider, baseUrl: target.value };
        }
    }
    _handleModelChange(e) {
        const target = e.target;
        if (this.editedProvider) {
            this.editedProvider = { ...this.editedProvider, model: target.value };
        }
    }
    async _handleSave() {
        if (!this.editedProvider)
            return;
        this.isSaving = true;
        this.dispatchEvent(new CustomEvent('save', {
            detail: this.editedProvider,
            bubbles: true,
            composed: true
        }));
        this.isSaving = false;
    }
};
exports.ProviderCard = ProviderCard;
ProviderCard.styles = [
    base_element_1.BaseElement.styles,
    (0, lit_1.css) `
      :host {
        display: block;
      }

      .card {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 12px;
      }

      .card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .card-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
      }

      .status {
        font-size: 11px;
        padding: 2px 6px;
        border-radius: 2px;
      }

      .status.configured {
        color: var(--vscode-testing-iconPassed);
        background: var(--vscode-testing-iconPassed);
        opacity: 0.15;
      }

      .status.unconfigured {
        color: var(--vscode-descriptionForeground);
        background: var(--vscode-descriptionForeground);
        opacity: 0.15;
      }

      .field {
        display: flex;
        align-items: center;
        margin-bottom: 8px;
        gap: 8px;
      }

      .field:last-of-type {
        margin-bottom: 0;
      }

      .field label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
        min-width: 70px;
      }

      vscode-textfield {
        flex: 1;
      }

      .actions {
        margin-top: 12px;
        padding-top: 8px;
        border-top: 1px solid var(--vscode-panel-border);
        display: flex;
        justify-content: flex-end;
      }
    `
];
__decorate([
    (0, decorators_js_1.property)({ type: Object })
], ProviderCard.prototype, "provider", void 0);
__decorate([
    (0, decorators_js_1.state)()
], ProviderCard.prototype, "isSaving", void 0);
__decorate([
    (0, decorators_js_1.state)()
], ProviderCard.prototype, "editedProvider", void 0);
exports.ProviderCard = ProviderCard = __decorate([
    (0, decorators_js_1.customElement)('provider-card')
], ProviderCard);
//# sourceMappingURL=provider-card.js.map
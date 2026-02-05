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
        const statusClass = this.editedProvider.configured ? 'configured' : 'unconfigured';
        return (0, lit_1.html) `
      <div class="card">
        <div class="header">
          <span class="status-dot ${statusClass}"></span>
          ${this.editedProvider.name}
        </div>

        <div class="form-group">
          <label>API Key</label>
          <vscode-textfield
            type="password"
            .value="${this.editedProvider.apiKey}"
            placeholder="输入 API Key"
            @input="${this._handleApiKeyChange}"
          ></vscode-textfield>
        </div>

        <div class="form-group">
          <label>Base URL</label>
          <vscode-textfield
            .value="${this.editedProvider.baseUrl}"
            placeholder="https://api.example.com"
            @input="${this._handleBaseUrlChange}"
          ></vscode-textfield>
        </div>

        <div class="form-group">
          <label>模型</label>
          <vscode-textfield
            .value="${this.editedProvider.model}"
            placeholder="例如：gpt-3.5-turbo"
            @input="${this._handleModelChange}"
          ></vscode-textfield>
        </div>

        <div class="actions">
          <vscode-button
            .disabled="${this.isSaving}"
            @click="${this._handleSave}"
          >
            ${this.isSaving ? '保存中...' : '保存'}
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
      .card {
        padding: 16px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 6px;
        margin-bottom: 12px;
      }

      .header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
        font-weight: 600;
        font-size: 14px;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
      }

      .status-dot.configured {
        background: var(--success);
      }

      .status-dot.unconfigured {
        background: var(--error);
      }

      .form-group {
        margin-bottom: 12px;
      }

      label {
        display: block;
        margin-bottom: 4px;
        font-size: 12px;
        color: var(--description);
      }

      vscode-textfield {
        width: 100%;
      }

      .actions {
        margin-top: 16px;
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
import { html, css, type CSSResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@vscode-elements/elements/dist/vscode-textfield';
import '@vscode-elements/elements/dist/vscode-button';
import { BaseElement } from '../common/base-element';

export interface ProviderConfig {
  id: string;
  name: string;
  apiKey: string;
  model: string;
  baseUrl: string;
  configured: boolean;
}

@customElement('provider-card')
export class ProviderCard extends BaseElement {
  static styles: CSSResult[] = [
    BaseElement.styles as CSSResult,
    css`
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

  @property({ type: Object }) provider!: ProviderConfig;
  @state() private isSaving = false;
  @state() private editedProvider: ProviderConfig | null = null;

  protected willUpdate(changedProps: Map<string, unknown>) {
    if ((changedProps.has('provider') || !this.editedProvider) && this.provider) {
      this.editedProvider = { ...this.provider };
    }
  }

  render() {
    if (!this.editedProvider) return html``;

    const statusClass = this.editedProvider.configured ? 'configured' : 'unconfigured';

    return html`
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

  private _handleApiKeyChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (this.editedProvider) {
      this.editedProvider = { ...this.editedProvider, apiKey: target.value };
    }
  }

  private _handleBaseUrlChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (this.editedProvider) {
      this.editedProvider = { ...this.editedProvider, baseUrl: target.value };
    }
  }

  private _handleModelChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (this.editedProvider) {
      this.editedProvider = { ...this.editedProvider, model: target.value };
    }
  }

  private async _handleSave() {
    if (!this.editedProvider) return;

    this.isSaving = true;
    this.dispatchEvent(new CustomEvent('save', {
      detail: this.editedProvider,
      bubbles: true,
      composed: true
    }));
    this.isSaving = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'provider-card': ProviderCard;
  }
}

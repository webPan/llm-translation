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

    return html`
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

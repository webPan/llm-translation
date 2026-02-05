import { html, css, type CSSResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@vscode-elements/elements/dist/vscode-single-select';
import '@vscode-elements/elements/dist/vscode-button';
import { BaseElement } from '../common/base-element';

export interface GeneralConfig {
  defaultProvider: string;
  displayMode: string;
  defaultTargetLang: string;
}

@customElement('settings-form')
export class SettingsForm extends BaseElement {
  static styles: CSSResult[] = [
    BaseElement.styles as CSSResult,
    css`
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

  @property({ type: Object }) config!: GeneralConfig;
  @state() private isSaving = false;
  @state() private editedConfig: GeneralConfig | null = null;

  protected willUpdate(changedProps: Map<string, unknown>) {
    if ((changedProps.has('config') || !this.editedConfig) && this.config) {
      this.editedConfig = { ...this.config };
    }
  }

  render() {
    if (!this.editedConfig) return html``;

    return html`
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

  private _handleProviderChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    if (this.editedConfig) {
      this.editedConfig = { ...this.editedConfig, defaultProvider: target.value };
    }
  }

  private _handleDisplayModeChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    if (this.editedConfig) {
      this.editedConfig = { ...this.editedConfig, displayMode: target.value };
    }
  }

  private _handleTargetLangChange(e: Event) {
    const target = e.target as HTMLSelectElement;
    if (this.editedConfig) {
      this.editedConfig = { ...this.editedConfig, defaultTargetLang: target.value };
    }
  }

  private async _handleSave() {
    if (!this.editedConfig) return;

    this.isSaving = true;
    this.dispatchEvent(new CustomEvent('save', {
      detail: this.editedConfig,
      bubbles: true,
      composed: true
    }));
    this.isSaving = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-form': SettingsForm;
  }
}

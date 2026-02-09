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
      :host {
        display: block;
      }

      .card {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 12px;
      }

      .card-header {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
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
        min-width: 90px;
      }

      vscode-single-select {
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
      <div class="card">
        <div class="card-header">常规设置</div>

        <div class="field">
          <label>默认服务商</label>
          <vscode-single-select
            .value="${this.editedConfig.defaultProvider}"
            @change="${this._handleProviderChange}"
          >
            <vscode-option value="deepseek">DeepSeek</vscode-option>
            <vscode-option value="qwen">千问</vscode-option>
            <vscode-option value="kimi">Kimi</vscode-option>
            <vscode-option value="glm">智谱</vscode-option>
          </vscode-single-select>
        </div>

        <div class="field">
          <label>显示模式</label>
          <vscode-single-select
            .value="${this.editedConfig.displayMode}"
            @change="${this._handleDisplayModeChange}"
          >
            <vscode-option value="simple">简单</vscode-option>
            <vscode-option value="normal">侧边栏</vscode-option>
          </vscode-single-select>
        </div>

        <div class="field">
          <label>目标语言</label>
          <vscode-single-select
            .value="${this.editedConfig.defaultTargetLang}"
            @change="${this._handleTargetLangChange}"
          >
            <vscode-option value="auto">自动检测</vscode-option>
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
            保存
          </vscode-button>
        </div>
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

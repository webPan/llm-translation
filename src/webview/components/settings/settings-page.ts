import { html, css, type CSSResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@vscode-elements/elements/dist/vscode-tabs';
import '@vscode-elements/elements/dist/vscode-tab-header';
import '@vscode-elements/elements/dist/vscode-tab-panel';
import { BaseElement } from '../common/base-element';
import './settings-form';
import './provider-card';
import './template-list';
import type { GeneralConfig } from './settings-form';
import type { ProviderConfig } from './provider-card';
import type { PromptTemplate } from './template-list';

interface AppConfig {
  general: GeneralConfig;
  providers: Record<string, ProviderConfig>;
}

@customElement('settings-page')
export class SettingsPage extends BaseElement {
  static styles: CSSResult[] = [
    BaseElement.styles as CSSResult,
    css`
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

      .loading,
      .error,
      .empty {
        padding: 40px 16px;
        text-align: center;
        color: var(--vscode-descriptionForeground);
        font-size: 13px;
      }

      .error {
        color: var(--vscode-errorForeground);
      }
    `,
  ];

  @state() private config: AppConfig | null = null;
  @state() private isLoading = true;
  @state() private error: string | null = null;
  @state() private templates: PromptTemplate[] = [];
  @state() private defaultTemplateId: string = 'default';

  connectedCallback() {
    super.connectedCallback();
    this._loadConfig();
  }

  private async _loadConfig() {
    try {
      this.dispatchEvent(
        new CustomEvent('load-config', {
          bubbles: true,
          composed: true,
        }),
      );
    } catch (err) {
      console.log('Error loading config:', err);
      this.error = '加载配置失败';
      this.isLoading = false;
    }
  }

  setConfig(config: AppConfig) {
    this.config = config;
    this.isLoading = false;
  }

  setTemplates(templates: PromptTemplate[], defaultId: string) {
    this.templates = templates;
    this.defaultTemplateId = defaultId;
  }

  render() {
    if (this.isLoading) {
      return html`<div class="loading">加载中...</div>`;
    }

    if (this.error) {
      return html`<div class="error">${this.error}</div>`;
    }

    if (!this.config) {
      return html`<div class="empty">暂无配置</div>`;
    }

    const providers = Object.values(this.config.providers);

    return html`
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
                ? html`<div class="empty">暂无配置的服务商</div>`
                : providers.map(
                    (provider) => html`
                      <provider-card
                        .provider="${provider}"
                        @save="${this._handleProviderSave}"
                      ></provider-card>
                    `,
                  )}
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

  private _handleGeneralSave(e: CustomEvent<GeneralConfig>) {
    this.dispatchEvent(
      new CustomEvent('save-general', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleProviderSave(e: CustomEvent<ProviderConfig>) {
    this.dispatchEvent(
      new CustomEvent('save-provider', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleTemplateSave(e: CustomEvent<PromptTemplate>) {
    this.dispatchEvent(
      new CustomEvent('template-save', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleTemplateDelete(e: CustomEvent<PromptTemplate>) {
    this.dispatchEvent(
      new CustomEvent('template-delete', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleTemplateSetDefault(e: CustomEvent<string>) {
    this.dispatchEvent(
      new CustomEvent('template-set-default', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleTemplateImport() {
    this.dispatchEvent(
      new CustomEvent('template-import', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleTemplateExport() {
    this.dispatchEvent(
      new CustomEvent('template-export', {
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _handleTemplateCopy(e: CustomEvent<PromptTemplate>) {
    this.dispatchEvent(
      new CustomEvent('template-copy', {
        detail: e.detail,
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-page': SettingsPage;
  }
}

import { html, css, type CSSResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@vscode-elements/elements/dist/vscode-tabs';
import '@vscode-elements/elements/dist/vscode-tab-header';
import '@vscode-elements/elements/dist/vscode-tab-panel';
import { BaseElement } from '../common/base-element';
import './settings-form';
import './provider-card';
import type { GeneralConfig } from './settings-form';
import type { ProviderConfig } from './provider-card';

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

  @state() private config: AppConfig | null = null;
  @state() private isLoading = true;
  @state() private error: string | null = null;

  connectedCallback() {
    super.connectedCallback();
    this._loadConfig();
  }

  private async _loadConfig() {
    try {
      // 通过自定义事件让 View Entry 处理请求
      this.dispatchEvent(new CustomEvent('load-config', {
        bubbles: true,
        composed: true
      }));
    } catch (err) {
      this.error = '加载配置失败';
      this.isLoading = false;
    }
  }

  setConfig(config: AppConfig) {
    this.config = config;
    this.isLoading = false;
  }

  render() {
    if (this.isLoading) {
      return html`
        <div class="loading">
          <p>加载中...</p>
        </div>
      `;
    }

    if (this.error) {
      return html`
        <div class="error">
          <p>${this.error}</p>
        </div>
      `;
    }

    if (!this.config) {
      return html`
        <div class="empty">
          <p>暂无配置</p>
        </div>
      `;
    }

    const providers = Object.values(this.config.providers);

    return html`
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
              ? html`<div class="empty">暂无配置的服务商</div>`
              : providers.map(provider => html`
                  <provider-card
                    .provider="${provider}"
                    @save="${this._handleProviderSave}"
                  ></provider-card>
                `)
            }
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

  private _handleGeneralSave(e: CustomEvent<GeneralConfig>) {
    this.dispatchEvent(new CustomEvent('save-general', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }

  private _handleProviderSave(e: CustomEvent<ProviderConfig>) {
    this.dispatchEvent(new CustomEvent('save-provider', {
      detail: e.detail,
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'settings-page': SettingsPage;
  }
}

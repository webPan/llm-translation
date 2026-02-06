import { html, css, type CSSResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '@vscode-elements/elements/dist/vscode-button';
import '@vscode-elements/elements/dist/vscode-divider';
import '@vscode-elements/elements/dist/vscode-collapsible';
import '@vscode-elements/elements/dist/vscode-icon';
import { BaseElement } from '../common/base-element';

export interface TranslationResult {
  original: string;
  translation: string;
  pronunciation?: string;
  alternatives?: string[];
  explanations?: Array<{ word?: string; meaning?: string; definition?: string }>;
  examples?: Array<{ original?: string; source?: string; translation?: string; target?: string }>;
  meta?: {
    sourceLang?: string;
    targetLang?: string;
    provider?: string;
    duration?: number;
  };
}

const LANGUAGE_NAMES: Record<string, string> = {
  zh: '中文',
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  fr: 'Français',
  de: 'Deutsch',
  es: 'Español',
  ru: 'Русский',
  auto: '自动检测'
};

function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code;
}

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms)) return '';
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

@customElement('full-page')
export class FullPage extends BaseElement {
  static styles: CSSResult[] = [
    BaseElement.styles as CSSResult,
    css`
      :host {
        display: block;
        margin: 24px;
        padding: 16px 24px;
      }

      @media (max-width: 720px) {
        :host {
          margin: 16px;
          padding: 12px 16px;
        }
      }

      @media (min-width: 1200px) {
        :host {
          margin: 32px;
          padding: 20px 32px;
        }
      }

      /* 头部元信息 */
      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
        padding-bottom: 12px;
      }

      .header-meta {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
      }

      .lang-direction {
        font-weight: 500;
        font-size: 13px;
        color: var(--vscode-foreground);
      }

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      /* 通用区块 */
      .section {
        margin-bottom: 16px;
      }

      .section-title {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--vscode-descriptionForeground);
        margin-bottom: 8px;
      }

      /* 原文 */
      .original-text {
        padding: 8px 12px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 3px;
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
        transition: background 0.15s ease;
      }

      /* 翻译结果 */
      .translation-result {
        padding: 8px 12px;
        padding-right: 40px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 3px;
        font-size: 13px;
        color: var(--vscode-foreground);
        position: relative;
        transition: background 0.15s ease;
      }

      .copy-icon {
        position: absolute;
        top: 8px;
        right: 12px;
        width: 18px;
        height: 18px;
        cursor: pointer;
        opacity: 0.5;
        transition: opacity 0.15s ease;
        flex-shrink: 0;
        z-index: 1;
      }

      .copy-icon:hover {
        opacity: 1;
      }

      .copy-icon vscode-icon {
        font-size: 16px;
        color: var(--vscode-foreground);
      }

      .pronunciation {
        margin-top: 8px;
        font-size: 12px;
        font-style: italic;
        color: var(--vscode-descriptionForeground);
      }

      /* 备选翻译 */
      .alternatives-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .alternative-item {
        padding: 8px 12px;
        padding-right: 40px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 3px;
        cursor: pointer;
        transition: background 0.15s ease;
        font-size: 13px;
        position: relative;
      }

      .alternative-item:hover {
        background: var(--vscode-editor-selectionBackground);
      }

      .alternative-item .copy-icon {
        top: 8px;
        right: 12px;
      }

      /* 词汇解释 */
      .vocab-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .vocab-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 10px 12px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 3px;
      }

      .vocab-word {
        font-size: 14px;
        font-weight: 600;
        color: var(--vscode-foreground);
      }

      .vocab-meaning {
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.5;
      }

      /* 例句 */
      .example-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .example-item {
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 12px;
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 3px;
      }

      .example-source {
        font-size: 13px;
        color: var(--vscode-descriptionForeground);
      }

      .example-target {
        font-size: 14px;
        color: var(--vscode-foreground);
      }

      /* 状态显示 */
      .state-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 80px 20px;
        text-align: center;
      }

      .state-icon {
        font-size: 48px;
        margin-bottom: 16px;
        opacity: 0.5;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .state-icon vscode-icon {
        font-size: 40px;
        color: var(--vscode-foreground);
      }

      .state-text {
        font-size: 14px;
        color: var(--vscode-descriptionForeground);
      }

      .state-text.error {
        color: var(--vscode-errorForeground);
      }

      /* 骨架屏 */
      .skeleton {
        display: flex;
        flex-direction: column;
        gap: 14px;
        padding: 6px 0;
      }

      .skeleton-line,
      .skeleton-block {
        background: var(--vscode-editor-inactiveSelectionBackground);
        border-radius: 4px;
        position: relative;
        overflow: hidden;
      }

      .skeleton-line {
        height: 12px;
      }

      .skeleton-line.short {
        width: 38%;
      }

      .skeleton-line.medium {
        width: 58%;
      }

      .skeleton-block {
        height: 72px;
      }

      .skeleton-line::after,
      .skeleton-block::after {
        content: '';
        position: absolute;
        top: 0;
        left: -40%;
        width: 40%;
        height: 100%;
        background: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0),
          rgba(255, 255, 255, 0.08),
          rgba(255, 255, 255, 0)
        );
        animation: skeleton-shimmer 1.2s ease-in-out infinite;
      }

      @keyframes skeleton-shimmer {
        0% { transform: translateX(0); }
        100% { transform: translateX(240%); }
      }

      /* Collapsible 样式 */
      .collapsible-section vscode-collapsible {
        --collapsible-background: var(--vscode-editor-inactiveSelectionBackground);
        margin-bottom: 8px;
      }

      /* 分隔线样式 - 与设置页面保持一致 */
      ::slotted(vscode-divider),
      vscode-divider {
        --divider-color: var(--vscode-panel-border);
        --divider-height: 1px;
        margin: 16px 0;
      }

    `
  ];

  @property({ type: Object }) result: TranslationResult | null = null;
  @property({ type: String }) state: 'idle' | 'loading' | 'error' = 'idle';
  @property({ type: String }) stateMessage = '';

  private _handleAction(action: string, detail?: any) {
    this.dispatchEvent(new CustomEvent('action', {
      detail: { action, ...detail },
      bubbles: true,
      composed: true
    }));
  }

  private async _handleCopyTranslation(text: string) {
    console.log('[FullPage] _handleCopyTranslation called with text:', text.substring(0, 50));
    try {
      await navigator.clipboard.writeText(text);
      console.log('[FullPage] Copy successful, dispatching copySuccess event');
      this._handleAction('copySuccess', { message: '复制成功' });
    } catch (err) {
      console.error('[FullPage] Copy failed:', err);
      this._handleAction('copyError', { message: '复制失败' });
    }
  }

  render() {
    if (this.state === 'loading') {
      return html`
        <div class="skeleton" aria-label="${escapeHtml(this.stateMessage || '正在翻译...')}">
          <div class="skeleton-line medium"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-line short"></div>
          <div class="skeleton-block"></div>
          <div class="skeleton-line"></div>
        </div>
      `;
    }

    if (this.state === 'error') {
      return html`
        <div class="state-container">
          <div class="state-icon">
            <vscode-icon name="error"></vscode-icon>
          </div>
          <div class="state-text error">${escapeHtml(this.stateMessage || '翻译失败')}</div>
        </div>
      `;
    }

    if (!this.result) {
      return html`
        <div class="state-container">
          <div class="state-icon">
            <vscode-icon name="note"></vscode-icon>
          </div>
          <div class="state-text">暂无翻译结果</div>
        </div>
      `;
    }

    const r = this.result;
    const meta = r.meta || {};
    const alternatives: string[] = Array.isArray(r.alternatives) ? r.alternatives : [];
    const explanations = Array.isArray(r.explanations) ? r.explanations : [];
    const examples = Array.isArray(r.examples) ? r.examples : [];

    // 语言方向
    const langDirection = meta.sourceLang && meta.targetLang
      ? `${getLanguageName(meta.sourceLang)} → ${getLanguageName(meta.targetLang)}`
      : '';

    // 服务商和耗时
    const metaItems = [];
    if (meta.provider) metaItems.push(html`<span class="meta-item" title="翻译服务商">${escapeHtml(meta.provider)}</span>`);
    if (meta.duration) metaItems.push(html`<span class="meta-item" title="翻译耗时">${escapeHtml(formatDuration(Number(meta.duration)))}</span>`);

    return html`
      <!-- 头部元信息 -->
      ${(langDirection || metaItems.length) ? html`
        <div class="header">
          <div class="header-meta">
            ${langDirection ? html`<span class="lang-direction">${escapeHtml(langDirection)}</span>` : ''}
            ${metaItems}
          </div>
        </div>
      ` : ''}

      <!-- 原文 -->
      <div class="section">
        <div class="section-title">原文</div>
        <div class="original-text">${escapeHtml(String(r.original || ''))}</div>
      </div>

      <vscode-divider></vscode-divider>

      <!-- 翻译结果 -->
      <div class="section">
        <div class="section-title">翻译</div>
        <div class="translation-result">
          ${escapeHtml(String(r.translation || ''))}
          ${r.pronunciation ? html`<div class="pronunciation">${escapeHtml(r.pronunciation)}</div>` : ''}
          <div class="copy-icon" @click="${() => this._handleCopyTranslation(r.translation || '')}" title="复制翻译">
            <vscode-icon name="copy"></vscode-icon>
          </div>
        </div>

      </div>

      <!-- 其他翻译 -->
      ${alternatives.length ? html`
        <vscode-divider></vscode-divider>
        <div class="section">
          <div class="section-title">其他翻译</div>
          <div class="alternatives-list">
            ${alternatives.map((alt, i) => html`
              <div class="alternative-item" @click="${() => this._handleAction('selectAlternative', { index: i })}">
                ${escapeHtml(alt)}
                <div class="copy-icon" @click="${(e: Event) => { e.stopPropagation(); this._handleCopyTranslation(alt); }}" title="复制">
                  <vscode-icon name="copy"></vscode-icon>
                </div>
              </div>
            `)}
          </div>
        </div>
      ` : ''}

      <!-- 词汇解释 -->
      ${explanations.length ? html`
        <vscode-divider></vscode-divider>
        <div class="section">
          <div class="section-title">词汇解释</div>
          <div class="vocab-list">
            ${explanations.map(e => html`
              <div class="vocab-item">
                <div class="vocab-word">${escapeHtml(String(e.word || ''))}</div>
                <div class="vocab-meaning">${escapeHtml(String(e.meaning || e.definition || ''))}</div>
              </div>
            `)}
          </div>
        </div>
      ` : ''}

      <!-- 例句 -->
      ${examples.length ? html`
        <vscode-divider></vscode-divider>
        <div class="section">
          <div class="section-title">例句</div>
          <div class="example-list">
            ${examples.map(ex => html`
              <div class="example-item">
                <div class="example-source">${escapeHtml(String(ex.original || ex.source || ''))}</div>
                <div class="example-target">${escapeHtml(String(ex.translation || ex.target || ''))}</div>
              </div>
            `)}
          </div>
        </div>
      ` : ''}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'full-page': FullPage;
  }
}

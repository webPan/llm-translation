"use strict";
/**
 * 翻译结果组件
 * 用于显示翻译结果的 Lit Web Component
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationResultComponent = void 0;
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
const repeat_js_1 = require("lit/directives/repeat.js");
const unsafe_html_js_1 = require("lit/directives/unsafe-html.js");
// ============================================================================
// 翻译结果组件
// ============================================================================
let TranslationResultComponent = class TranslationResultComponent extends lit_1.LitElement {
    constructor() {
        super(...arguments);
        this.showActions = true;
        this.showAlternatives = true;
        this.showMeta = true;
        this.compact = false;
        // 内部状态
        this.selectedAlternative = -1;
    }
    // 事件定义
    static get properties() {
        return {
            result: { type: Object },
            showActions: { type: Boolean },
            showAlternatives: { type: Boolean },
            showMeta: { type: Boolean },
            compact: { type: Boolean },
        };
    }
    /**
     * 渲染主要翻译内容
     */
    renderMainTranslation() {
        if (!this.result)
            return (0, lit_1.html) `<div class="empty-state">暂无翻译结果</div>`;
        const translation = this.selectedAlternative >= 0 && this.result.alternatives?.[this.selectedAlternative]
            ? this.result.alternatives[this.selectedAlternative]
            : this.result.translation;
        return (0, lit_1.html) `
      <div class="translation-main ${this.compact ? 'compact' : ''}">
        ${this.renderTranslationText(translation)}
        ${this.result.pronunciation ? (0, lit_1.html) `<div class="pronunciation">${this.result.pronunciation}</div>` : ''}
      </div>
    `;
    }
    /**
     * 渲染翻译文本（支持 Markdown）
     */
    renderTranslationText(text) {
        // 简单的 Markdown 解析
        let html = text
            // 加粗
            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
            // 斜体
            .replace(/\*(.+?)\*/g, '<em>$1</em>')
            // 代码
            .replace(/`(.+?)`/g, '<code>$1</code>')
            // 换行
            .replace(/\n/g, '<br>');
        return (0, unsafe_html_js_1.unsafeHTML)(html);
    }
    /**
     * 渲染元数据
     */
    renderMeta() {
        if (!this.showMeta || !this.result?.raw)
            return (0, lit_1.html) ``;
        const raw = this.result.raw;
        const items = [];
        if (raw.sourceLang) {
            items.push((0, lit_1.html) `<span class="meta-item">${this.getLanguageName(raw.sourceLang)} → ${this.getLanguageName(raw.targetLang)}</span>`);
        }
        if (raw.provider) {
            items.push((0, lit_1.html) `<span class="meta-item">${raw.provider}</span>`);
        }
        if (raw.duration) {
            items.push((0, lit_1.html) `<span class="meta-item">${this.formatDuration(raw.duration)}</span>`);
        }
        if (raw.model) {
            items.push((0, lit_1.html) `<span class="meta-item">${raw.model}</span>`);
        }
        if (items.length === 0)
            return (0, lit_1.html) ``;
        return (0, lit_1.html) `<div class="meta">${items}</div>`;
    }
    /**
     * 渲染替代翻译
     */
    renderAlternatives() {
        if (!this.showAlternatives || !this.result?.alternatives || this.result.alternatives.length === 0) {
            return (0, lit_1.html) ``;
        }
        return (0, lit_1.html) `
      <div class="alternatives">
        <div class="alternatives-title">其他翻译</div>
        ${(0, repeat_js_1.repeat)(this.result.alternatives, (alt, index) => index, (alt, index) => (0, lit_1.html) `
            <div
              class="alternative-item ${this.selectedAlternative === index ? 'selected' : ''}"
              @click="${() => this.selectAlternative(index)}"
            >
              ${alt}
            </div>
          `)}
      </div>
    `;
    }
    /**
     * 渲染解释
     */
    renderExplanations() {
        if (!this.result?.explanations || this.result.explanations.length === 0) {
            return (0, lit_1.html) ``;
        }
        return (0, lit_1.html) `
      <div class="explanations">
        ${(0, repeat_js_1.repeat)(this.result.explanations, (exp) => exp.word || exp.part || '', (exp) => (0, lit_1.html) `
            <div class="explanation-item">
              ${exp.part ? (0, lit_1.html) `<div class="explanation-part">${exp.part}</div>` : ''}
              <div class="explanation-definition">${exp.definition || ''}</div>
            </div>
          `)}
      </div>
    `;
    }
    /**
     * 渲染例句
     */
    renderExamples() {
        if (!this.result?.examples || this.result.examples.length === 0) {
            return (0, lit_1.html) ``;
        }
        return (0, lit_1.html) `
      <div class="examples">
        ${(0, repeat_js_1.repeat)(this.result.examples, (ex) => ex.source + ex.target, (ex) => (0, lit_1.html) `
            <div class="example-item">
              <div class="example-source">${ex.source}</div>
              <div class="example-target">${ex.target}</div>
            </div>
          `)}
      </div>
    `;
    }
    /**
     * 渲染操作按钮
     */
    renderActions() {
        if (!this.showActions)
            return (0, lit_1.html) ``;
        return (0, lit_1.html) `
      <div class="actions">
        <button class="btn" @click="${this.onCopy}" ?disabled="${!this.result}">
          复制
        </button>
        <button class="btn btn-secondary" @click="${this.onExpand}" ?disabled="${!this.result}">
          详情
        </button>
        <button class="btn btn-secondary" @click="${this.onReplace}" ?disabled="${!this.result}">
          替换
        </button>
      </div>
    `;
    }
    /**
     * 选择替代翻译
     */
    selectAlternative(index) {
        this.selectedAlternative = this.selectedAlternative === index ? -1 : index;
        // 触发自定义事件
        this.dispatchEvent(new CustomEvent('alternative-selected', {
            detail: { index, text: this.result?.alternatives?.[index] },
        }));
    }
    /**
     * 复制翻译
     */
    onCopy() {
        const translation = this.selectedAlternative >= 0 && this.result?.alternatives?.[this.selectedAlternative]
            ? this.result.alternatives[this.selectedAlternative]
            : this.result?.translation;
        if (translation) {
            navigator.clipboard.writeText(translation).then(() => {
                this.dispatchEvent(new CustomEvent('copy', { detail: { text: translation } }));
            });
        }
    }
    /**
     * 展开详情
     */
    onExpand() {
        this.dispatchEvent(new CustomEvent('expand'));
    }
    /**
     * 替换原文
     */
    onReplace() {
        const translation = this.selectedAlternative >= 0 && this.result?.alternatives?.[this.selectedAlternative]
            ? this.result.alternatives[this.selectedAlternative]
            : this.result?.translation;
        if (translation) {
            this.dispatchEvent(new CustomEvent('replace', { detail: { text: translation } }));
        }
    }
    /**
     * 获取语言名称
     */
    getLanguageName(code) {
        const names = {
            'zh': '中文',
            'en': '英语',
            'ja': '日语',
            'auto': '自动',
        };
        return names[code] || code;
    }
    /**
     * 格式化持续时间
     */
    formatDuration(ms) {
        if (ms < 1000)
            return `${ms}ms`;
        const seconds = Math.floor(ms / 1000);
        return `${seconds}s`;
    }
    /**
     * 渲染方法
     */
    render() {
        return (0, lit_1.html) `
      <div class="translation-result">
        ${this.renderMainTranslation()}
        ${this.renderMeta()}
        ${this.renderAlternatives()}
        ${this.renderExplanations()}
        ${this.renderExamples()}
        ${this.renderActions()}
      </div>
    `;
    }
};
exports.TranslationResultComponent = TranslationResultComponent;
// 样式定义
TranslationResultComponent.styles = (0, lit_1.css) `
    :host {
      display: block;
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--vscode-foreground);
    }

    .translation-result {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .translation-main {
      font-size: var(--vscode-font-size);
      line-height: 1.6;
    }

    .translation-main.compact {
      font-size: 13px;
    }

    .pronunciation {
      font-style: italic;
      color: var(--vscode-textLink-foreground);
      margin-top: 4px;
      font-size: 0.9em;
    }

    .meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      flex-wrap: wrap;
    }

    .meta-item {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .meta-item::before {
      content: '•';
      opacity: 0.5;
    }

    .meta-item:first-child::before {
      content: none;
    }

    .alternatives {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin-top: 4px;
    }

    .alternatives-title {
      font-size: 11px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 2px;
    }

    .alternative-item {
      padding: 8px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 3px;
      cursor: pointer;
      transition: background 0.2s;
      font-size: 13px;
    }

    .alternative-item:hover {
      background: var(--vscode-toolbar-hoverBackground);
    }

    .alternative-item.selected {
      border: 1px solid var(--vscode-button-primaryBackground);
    }

    .explanations {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .explanation-item {
      padding: 10px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 3px;
    }

    .explanation-part {
      font-size: 12px;
      color: var(--vscode-textLink-foreground);
      margin-bottom: 4px;
    }

    .explanation-definition {
      font-size: 13px;
      line-height: 1.5;
    }

    .examples {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 8px;
    }

    .example-item {
      padding: 10px;
      background: var(--vscode-editor-inactiveSelectionBackground);
      border-radius: 3px;
    }

    .example-source {
      font-size: 12px;
      color: var(--vscode-descriptionForeground);
      margin-bottom: 4px;
    }

    .example-target {
      font-size: 13px;
    }

    .actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }

    .btn {
      flex: 1;
      padding: 6px 10px;
      background: var(--vscode-button-primaryBackground);
      color: var(--vscode-button-primaryForeground);
      border: none;
      border-radius: 2px;
      cursor: pointer;
      font-size: 12px;
      transition: opacity 0.2s;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .btn-secondary {
      background: var(--vscode-button-secondaryBackground);
      color: var(--vscode-button-secondaryForeground);
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .empty-state {
      text-align: center;
      padding: 24px;
      color: var(--vscode-descriptionForeground);
    }

    .loading {
      text-align: center;
      padding: 24px;
      color: var(--vscode-descriptionForeground);
    }

    .error {
      padding: 12px;
      background: var(--vscode-errorBackground);
      color: var(--vscode-errorForeground);
      border-radius: 3px;
      border-left: 4px solid var(--vscode-errorForeground);
    }
  `;
__decorate([
    (0, decorators_js_1.property)({ type: Object })
], TranslationResultComponent.prototype, "result", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], TranslationResultComponent.prototype, "showActions", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], TranslationResultComponent.prototype, "showAlternatives", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], TranslationResultComponent.prototype, "showMeta", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: Boolean })
], TranslationResultComponent.prototype, "compact", void 0);
__decorate([
    (0, decorators_js_1.state)()
], TranslationResultComponent.prototype, "selectedAlternative", void 0);
exports.TranslationResultComponent = TranslationResultComponent = __decorate([
    (0, decorators_js_1.customElement)('llm-translation-result')
], TranslationResultComponent);
//# sourceMappingURL=translation-result.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateList = void 0;
const lit_1 = require("lit");
const decorators_js_1 = require("lit/decorators.js");
require("@vscode-elements/elements/dist/vscode-button");
require("@vscode-elements/elements/dist/vscode-textfield");
require("@vscode-elements/elements/dist/vscode-textarea");
const base_element_1 = require("../common/base-element");
let TemplateList = class TemplateList extends base_element_1.BaseElement {
    constructor() {
        super(...arguments);
        this.templates = [];
        this.defaultTemplateId = '';
        this.editingTemplate = null;
        this.showNewForm = false;
    }
    render() {
        return (0, lit_1.html) `
      <div class="toolbar">
        <span class="toolbar-title">提示词模板</span>
        <div class="toolbar-actions">
          <vscode-button @click="${this._handleImport}" appearance="secondary">导入</vscode-button>
          <vscode-button @click="${this._handleExport}" appearance="secondary">导出</vscode-button>
          <vscode-button @click="${this._handleNew}">+ 新建</vscode-button>
        </div>
      </div>

      ${this.showNewForm || this.editingTemplate ? this._renderEditForm() : ''}

      <div class="template-list">
        ${this.templates.length === 0
            ? (0, lit_1.html) `<div class="empty">暂无模板</div>`
            : this.templates.map(template => this._renderTemplateItem(template))}
      </div>

      <div class="variables-hint">
        可用变量: <code>{text}</code> <code>{sourceLang}</code> <code>{targetLang}</code>
      </div>
    `;
    }
    _renderTemplateItem(template) {
        const isDefault = template.id === this.defaultTemplateId;
        const isBuiltin = template.isBuiltin !== false;
        return (0, lit_1.html) `
      <div class="template-item ${isDefault ? 'is-default' : ''}" @click="${() => this._handleSelect(template)}">
        <div class="template-header">
          <span class="template-name">${template.name}</span>
          <span class="template-badge">${isDefault ? '默认' : (isBuiltin ? '内置' : '自定义')}</span>
        </div>
        <div class="template-description">${template.description}</div>
        ${!isBuiltin ? (0, lit_1.html) `
          <div class="template-actions" @click="${(e) => e.stopPropagation()}">
            <vscode-button @click="${() => this._handleEdit(template)}" appearance="secondary" style="padding: 2px 8px; font-size: 11px;">编辑</vscode-button>
            <vscode-button @click="${() => this._handleDelete(template)}" appearance="secondary" style="padding: 2px 8px; font-size: 11px;">删除</vscode-button>
          </div>
        ` : ''}
      </div>
    `;
    }
    _renderEditForm() {
        const isEditing = this.editingTemplate !== null;
        const template = isEditing ? this.editingTemplate : { id: '', name: '', description: '', template: '' };
        return (0, lit_1.html) `
      <div class="card" style="border: 1px solid var(--vscode-panel-border); border-radius: 3px; padding: 12px; margin-bottom: 12px;">
        <div style="font-size: 13px; font-weight: 600; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--vscode-panel-border);">
          ${isEditing ? '编辑模板' : '新建模板'}
        </div>

        <div class="field" style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
          <label style="font-size: 12px; color: var(--vscode-descriptionForeground); min-width: 70px;">名称</label>
          <vscode-textfield
            id="template-name"
            .value="${template.name}"
            placeholder="模板名称"
            style="flex: 1;"
          ></vscode-textfield>
        </div>

        <div class="field" style="display: flex; align-items: center; margin-bottom: 8px; gap: 8px;">
          <label style="font-size: 12px; color: var(--vscode-descriptionForeground); min-width: 70px;">描述</label>
          <vscode-textfield
            id="template-desc"
            .value="${template.description}"
            placeholder="简短描述"
            style="flex: 1;"
          ></vscode-textfield>
        </div>

        <div style="margin-bottom: 8px;">
          <label style="display: block; font-size: 12px; color: var(--vscode-descriptionForeground); margin-bottom: 4px;">模板内容</label>
          <vscode-textarea
            id="template-content"
            rows="8"
            .value="${template.template}"
            placeholder="使用 {text} {sourceLang} {targetLang} 作为变量"
            style="width: 100%;"
          ></vscode-textarea>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end;">
          <vscode-button @click="${this._handleCancelEdit}" appearance="secondary">取消</vscode-button>
          <vscode-button @click="${this._handleSaveTemplate}">保存</vscode-button>
        </div>
      </div>
    `;
    }
    _handleSelect(template) {
        if (template.id !== this.defaultTemplateId) {
            this.dispatchEvent(new CustomEvent('set-default', {
                detail: template.id,
                bubbles: true,
                composed: true
            }));
        }
    }
    _handleNew() {
        this.editingTemplate = null;
        this.showNewForm = true;
    }
    _handleEdit(template) {
        this.editingTemplate = { ...template };
        this.showNewForm = false;
    }
    _handleCancelEdit() {
        this.editingTemplate = null;
        this.showNewForm = false;
    }
    _handleSaveTemplate() {
        const nameInput = document.getElementById('template-name');
        const descInput = document.getElementById('template-desc');
        const contentInput = document.getElementById('template-content');
        const template = {
            id: this.editingTemplate?.id || `custom-${Date.now()}`,
            name: nameInput?.value || '',
            description: descInput?.value || '',
            template: contentInput?.value || '',
            isBuiltin: false
        };
        if (!template.name || !template.template) {
            this.dispatchEvent(new CustomEvent('error', {
                detail: '请填写模板名称和内容',
                bubbles: true
            }));
            return;
        }
        this.dispatchEvent(new CustomEvent('save', {
            detail: template,
            bubbles: true,
            composed: true
        }));
        this.editingTemplate = null;
        this.showNewForm = false;
    }
    _handleDelete(template) {
        this.dispatchEvent(new CustomEvent('delete', {
            detail: template,
            bubbles: true,
            composed: true
        }));
    }
    _handleSetDefault(template) {
        this.dispatchEvent(new CustomEvent('set-default', {
            detail: template.id,
            bubbles: true,
            composed: true
        }));
    }
    _handleImport() {
        this.dispatchEvent(new CustomEvent('import', {
            bubbles: true,
            composed: true
        }));
    }
    _handleExport() {
        this.dispatchEvent(new CustomEvent('export', {
            bubbles: true,
            composed: true
        }));
    }
};
exports.TemplateList = TemplateList;
TemplateList.styles = [
    base_element_1.BaseElement.styles,
    (0, lit_1.css) `
      :host {
        display: block;
      }

      .toolbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .toolbar-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
      }

      .toolbar-actions {
        display: flex;
        gap: 8px;
      }

      .template-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .template-item {
        border: 1px solid var(--vscode-panel-border);
        border-radius: 3px;
        padding: 10px 12px;
        cursor: pointer;
        transition: border-color 0.15s;
      }

      .template-item:hover {
        border-color: var(--vscode-button-primaryBackground);
      }

      .template-item.is-default {
        border-color: var(--vscode-button-primaryBackground);
        background: var(--vscode-editor-inactiveSelectionBackground);
      }

      .template-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 4px;
      }

      .template-name {
        font-size: 13px;
        font-weight: 500;
        color: var(--vscode-foreground);
      }

      .template-badge {
        font-size: 10px;
        padding: 2px 4px;
        border-radius: 2px;
        background: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
      }

      .template-item.is-default .template-badge {
        background: var(--vscode-button-primaryBackground);
        color: var(--vscode-button-primaryForeground);
      }

      .template-description {
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
        line-height: 1.4;
      }

      .template-actions {
        display: flex;
        gap: 6px;
        margin-top: 8px;
      }

      .empty {
        padding: 40px 16px;
        text-align: center;
        color: var(--vscode-descriptionForeground);
        font-size: 12px;
      }

      .variables-hint {
        margin-top: 12px;
        padding: 8px;
        background: var(--vscode-textBlockQuote-background);
        border-left: 3px solid var(--vscode-button-primaryBackground);
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
      }

      .variables-hint code {
        font-family: var(--vscode-editor-font-family);
        background: var(--vscode-editor-selectionBackground);
        padding: 2px 4px;
        border-radius: 2px;
      }
    `
];
__decorate([
    (0, decorators_js_1.property)({ type: Array })
], TemplateList.prototype, "templates", void 0);
__decorate([
    (0, decorators_js_1.property)({ type: String })
], TemplateList.prototype, "defaultTemplateId", void 0);
__decorate([
    (0, decorators_js_1.state)()
], TemplateList.prototype, "editingTemplate", void 0);
__decorate([
    (0, decorators_js_1.state)()
], TemplateList.prototype, "showNewForm", void 0);
exports.TemplateList = TemplateList = __decorate([
    (0, decorators_js_1.customElement)('template-list')
], TemplateList);
//# sourceMappingURL=template-list.js.map
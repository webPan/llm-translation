import { html, css, type CSSResult } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import '@vscode-elements/elements/dist/vscode-button';
import '@vscode-elements/elements/dist/vscode-textfield';
import '@vscode-elements/elements/dist/vscode-textarea';
import '@vscode-elements/elements/dist/vscode-icon';
import { BaseElement } from '../common/base-element';

export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  isBuiltin?: boolean;
}

@customElement('template-list')
export class TemplateList extends BaseElement {
  static styles: CSSResult[] = [
    BaseElement.styles as CSSResult,
    css`
      :host {
        display: block;
      }

      .container {
        display: flex;
        gap: 16px;
        height: 100%;
        min-height: 400px;
      }

      .sidebar {
        width: 180px;
        flex-shrink: 0;
        display: flex;
        flex-direction: column;
        border-right: 1px solid var(--vscode-panel-border);
        padding-right: 12px;
      }

      .sidebar-title {
        font-size: 13px;
        font-weight: 600;
        color: var(--vscode-foreground);
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .template-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
        overflow-y: auto;
      }

      .template-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 10px;
        border-radius: 3px;
        cursor: pointer;
        transition: background-color 0.15s;
        font-size: 12px;
        color: var(--vscode-foreground);
      }

      .template-item:hover {
        background: var(--vscode-list-hoverBackground);
      }

      .template-item.is-selected {
        background: var(--vscode-list-activeSelectionBackground);
        color: var(--vscode-list-activeSelectionForeground);
      }

      .template-name {
        display: inline-flex;
        align-items: center;
      }

      .default-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-left: 6px;
        color: var(--vscode-notificationsInfoIcon-foreground, var(--vscode-textLink-foreground));
      }

      .default-icon vscode-icon {
        font-size: 12px;
      }

      .template-item-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.15s;
      }

      .template-item:hover .template-item-actions,
      .template-item.is-selected .template-item-actions {
        opacity: 1;
      }



      .main {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-width: 0;
      }

      .toolbar {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        margin-bottom: 12px;
        padding-bottom: 8px;
        border-bottom: 1px solid var(--vscode-panel-border);
        gap: 8px;
      }

      .edit-form {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
      }

      .field-block {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-block .field-label {
        font-size: 12px;
        color: var(--vscode-descriptionForeground);
      }

      .field-block vscode-textfield,
      .field-block vscode-textarea {
        width: 100%;
      }

      .template-content vscode-textarea {
        min-height: 280px;
        max-height: 400px;
      }

      .variables-section {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        background: var(--vscode-textBlockQuote-background);
        border-left: 3px solid var(--vscode-button-primaryBackground);
        font-size: 11px;
        color: var(--vscode-descriptionForeground);
      }

      .variables-section-title {
        font-weight: 600;
        color: var(--vscode-foreground);
        flex-shrink: 0;
      }

      .variables-list {
        display: flex;
        gap: 8px;
      }

      .variable-tag {
        font-family: var(--vscode-editor-font-family);
        background: var(--vscode-editor-selectionBackground);
        padding: 2px 6px;
        border-radius: 2px;
        font-size: 11px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
        margin-top: auto;
        padding-top: 12px;
        border-top: 1px solid var(--vscode-panel-border);
      }

      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        color: var(--vscode-descriptionForeground);
        font-size: 13px;
        gap: 12px;
      }
    `
  ];

  @property({ type: Array }) templates: PromptTemplate[] = [];
  @property({ type: String }) defaultTemplateId: string = '';
  @state() private selectedTemplateId: string = '';
  @state() private editingTemplate: PromptTemplate | null = null;
  @state() private showNewForm = false;

  @query('#new-template-name') private _nameInput!: HTMLInputElement;
  @query('#new-template-desc') private _descInput!: HTMLInputElement;
  @query('#new-template-content') private _contentInput!: HTMLTextAreaElement;

  connectedCallback() {
    super.connectedCallback();
    // 默认选中第一个模板
    if (this.templates.length > 0 && !this.selectedTemplateId) {
      this.selectedTemplateId = this.templates[0].id;
    }
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);
    // 当模板列表变化时，如果当前选中的不存在了，选中第一个
    if (changedProperties.has('templates')) {
      const validTemplates = this.templates.filter(t => t != null);
      if (validTemplates.length > 0) {
        const exists = validTemplates.find(t => t!.id === this.selectedTemplateId);
        if (!exists) {
          this.selectedTemplateId = validTemplates[0]!.id;
        }
      }
    }
  }

  render() {
    const selectedTemplate = this.templates.find(t => t.id === this.selectedTemplateId);

    return html`
      <div class="container">
        ${this._renderSidebar()}
        ${this._renderMain(selectedTemplate)}
      </div>
    `;
  }

  private _renderSidebar() {
    return html`
      <div class="sidebar">
        <div class="sidebar-title">提示词模板</div>
        <div class="template-list">
          ${this.templates.filter(t => t != null).map(template => {
            const isSelected = template.id === this.selectedTemplateId;
            const isDefault = template.id === this.defaultTemplateId;
            const isBuiltin = template.isBuiltin !== false;
            return html`
              <div class="template-item ${isSelected ? 'is-selected' : ''}"
                   @click="${() => this._handleSelect(template)}">
                <span class="template-name">${template.name}${isDefault ? html`<span class="default-icon"><vscode-icon name="sparkle-filled"></vscode-icon></span>` : ''}</span>
                ${!isBuiltin ? html`
                  <span class="template-item-actions">
                    <span @click="${(e: Event) => { e.stopPropagation(); this._handleDelete(template); }}">删除</span>
                  </span>
                ` : ''}
              </div>
            `;
          })}
        </div>
      </div>
    `;
  }

  private _renderMain(selectedTemplate: PromptTemplate | undefined) {
    if (this.showNewForm || this.editingTemplate) {
      return this._renderEditForm();
    }

    if (!selectedTemplate) {
      return html`
        <div class="main">
          <div class="empty-state">
            <span>请选择一个模板或创建新模板</span>
          </div>
        </div>
      `;
    }

    const isDefault = selectedTemplate.id === this.defaultTemplateId;
    const isBuiltin = selectedTemplate.isBuiltin !== false;

    return html`
      <div class="main">
        <div class="toolbar">
          <vscode-button @click="${this._handleImport}" appearance="secondary">导入</vscode-button>
          <vscode-button @click="${this._handleExport}" appearance="secondary">导出</vscode-button>
          <vscode-button @click="${this._handleNew}" appearance="secondary">+ 新建</vscode-button>
          ${!isDefault ? html`
            <vscode-button @click="${() => this._handleSetDefault(selectedTemplate)}" appearance="primary">设为默认</vscode-button>
          ` : ''}
        </div>

        <div class="edit-form">
          <div class="field-block">
            <span class="field-label">模板名称</span>
            <vscode-textfield
              .value="${selectedTemplate.name}"
              placeholder="模板名称"
              ?readonly="${isBuiltin}"
              @change="${(e: Event) => this._handleFieldChange('name', (e.target as HTMLInputElement).value)}"
            ></vscode-textfield>
          </div>

          <div class="field-block">
            <span class="field-label">描述</span>
            <vscode-textfield
              .value="${selectedTemplate.description}"
              placeholder="简短描述"
              ?readonly="${isBuiltin}"
              @change="${(e: Event) => this._handleFieldChange('description', (e.target as HTMLInputElement).value)}"
            ></vscode-textfield>
          </div>

          <div class="field-block template-content">
            <span class="field-label">模板内容</span>
            <vscode-textarea
              .value="${selectedTemplate.template}"
              placeholder="使用 {text} {sourceLang} {targetLang} 作为变量"
              ?readonly="${isBuiltin}"
              @change="${(e: Event) => this._handleFieldChange('template', (e.target as HTMLTextAreaElement).value)}"
            ></vscode-textarea>
          </div>

          <div class="variables-section">
            <span class="variables-section-title">可用变量:</span>
            <div class="variables-list">
              <span class="variable-tag">{text}</span>
              <span class="variable-tag">{sourceLang}</span>
              <span class="variable-tag">{targetLang}</span>
            </div>
          </div>

          ${!isBuiltin ? html`
            <div class="actions">
              <vscode-button @click="${() => this._handleSaveChanges(selectedTemplate)}" appearance="primary">保存</vscode-button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private _renderEditForm() {
    const isEditing = this.editingTemplate !== null;
    const template = isEditing ? this.editingTemplate! : { id: '', name: '', description: '', template: '' };

    return html`
      <div class="main">
        <div class="toolbar">
          <vscode-button @click="${this._handleCancelEdit}" appearance="secondary">取消</vscode-button>
        </div>

        <div class="edit-form">
          <div class="field-block">
            <span class="field-label">模板名称</span>
            <vscode-textfield
              id="new-template-name"
              .value="${template.name}"
              placeholder="模板名称"
            ></vscode-textfield>
          </div>

          <div class="field-block">
            <span class="field-label">描述</span>
            <vscode-textfield
              id="new-template-desc"
              .value="${template.description}"
              placeholder="简短描述"
            ></vscode-textfield>
          </div>

          <div class="field-block template-content">
            <span class="field-label">模板内容</span>
            <vscode-textarea
              id="new-template-content"
              .value="${template.template}"
              placeholder="使用 {text} {sourceLang} {targetLang} 作为变量"
            ></vscode-textarea>
          </div>

          <div class="variables-section">
            <span class="variables-section-title">可用变量:</span>
            <div class="variables-list">
              <span class="variable-tag">{text}</span>
              <span class="variable-tag">{sourceLang}</span>
              <span class="variable-tag">{targetLang}</span>
            </div>
          </div>

          <div class="actions">
            <vscode-button @click="${this._handleSaveTemplate}" appearance="primary">保存</vscode-button>
          </div>
        </div>
      </div>
    `;
  }

  private _handleSelect(template: PromptTemplate) {
    this.selectedTemplateId = template.id;
    this.showNewForm = false;
    this.editingTemplate = null;
  }

  private _handleFieldChange(field: keyof PromptTemplate, value: string) {
    const selectedTemplate = this.templates.find(t => t.id === this.selectedTemplateId);
    if (!selectedTemplate || selectedTemplate.isBuiltin !== false) return;

    const updatedTemplate = { ...selectedTemplate, [field]: value };
    // 实时保存
    this.dispatchEvent(new CustomEvent('save', {
      detail: updatedTemplate,
      bubbles: true,
      composed: true
    }));
  }

  private _handleSaveChanges(template: PromptTemplate) {
    this.dispatchEvent(new CustomEvent('save', {
      detail: template,
      bubbles: true,
      composed: true
    }));
  }

  private _handleNew() {
    this.editingTemplate = null;
    this.showNewForm = true;
  }

  private _handleEdit(template: PromptTemplate) {
    this.editingTemplate = { ...template };
    this.showNewForm = false;
  }

  private _handleCancelEdit() {
    this.editingTemplate = null;
    this.showNewForm = false;
  }

  private _handleSaveTemplate() {
    const template = {
      id: this.editingTemplate?.id || `custom-${Date.now()}`,
      name: this._nameInput?.value || '',
      description: this._descInput?.value || '',
      template: this._contentInput?.value || '',
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
    this.selectedTemplateId = template.id;
  }

  private _handleDelete(template: PromptTemplate) {
    this.dispatchEvent(new CustomEvent('delete', {
      detail: template,
      bubbles: true,
      composed: true
    }));
    if (this.selectedTemplateId === template.id) {
      this.selectedTemplateId = this.templates.find(t => t.id !== template.id)?.id || '';
    }
  }

  private _handleSetDefault(template: PromptTemplate) {
    this.dispatchEvent(new CustomEvent('set-default', {
      detail: template.id,
      bubbles: true,
      composed: true
    }));
  }

  private _handleCopy(template: PromptTemplate) {
    this.dispatchEvent(new CustomEvent('copy', {
      detail: template,
      bubbles: true,
      composed: true
    }));
  }

  private _handleImport() {
    this.dispatchEvent(new CustomEvent('import', {
      bubbles: true,
      composed: true
    }));
  }

  private _handleExport() {
    this.dispatchEvent(new CustomEvent('export', {
      bubbles: true,
      composed: true
    }));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'template-list': TemplateList;
  }
}

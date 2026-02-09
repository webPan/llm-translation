import { LitElement, css, type CSSResult } from 'lit';

/**
 * 基础元素类
 * 提供 VS Code 主题变量共享样式
 */
export class BaseElement extends LitElement {
  static styles: CSSResult | CSSResult[] = css`
    :host {
      --background: var(--vscode-editor-background);
      --foreground: var(--vscode-editor-foreground);
      --primary: var(--vscode-button-primaryBackground);
      --primary-foreground: var(--vscode-button-primaryForeground);
      --border: var(--vscode-panel-border);
      --input-background: var(--vscode-input-background);
      --input-foreground: var(--vscode-input-foreground);
      --input-border: var(--vscode-input-border);
      --error: var(--vscode-errorForeground);
      --success: var(--vscode-testing-iconPassed);
      --warning: var(--vscode-editorWarning-foreground);
      --description: var(--vscode-descriptionForeground);
      
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      color: var(--foreground);
    }

    * {
      box-sizing: border-box;
    }
  `;
}

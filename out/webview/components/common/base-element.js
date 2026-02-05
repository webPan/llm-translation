"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseElement = void 0;
const lit_1 = require("lit");
/**
 * 基础元素类
 * 提供 VS Code 主题变量共享样式
 */
class BaseElement extends lit_1.LitElement {
}
exports.BaseElement = BaseElement;
BaseElement.styles = (0, lit_1.css) `
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
//# sourceMappingURL=base-element.js.map
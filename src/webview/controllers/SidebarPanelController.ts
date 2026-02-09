import * as vscode from 'vscode';
import type { TranslationResult } from '../../types';
import { BasePanelController, BasePanelManager, type BridgeMessage } from './BasePanelController';

export class SidebarPanelController extends BasePanelController {
  private currentResult: TranslationResult | null = null;
  private currentText = '';
  private isTranslating = false;

  protected getPanelConfig() {
    return {
      id: 'sidebar-panel',
      title: '翻译详情',
      viewType: 'llmTranslation.sidebar',
      retainContextWhenHidden: true,
    };
  }

  protected getHtmlContent(): string {
    const nonce = this.getNonce();
    const scriptUri = this.getResourceUri('views/sidebar.js');
    const codiconUri = this.getResourceUri('views/styles/codicons/codicon.css');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${this.panel.webview.cspSource}; font-src ${this.panel.webview.cspSource};">
  <title>翻译详情</title>
  <link rel="stylesheet" href="${codiconUri}" id="vscode-codicon-stylesheet">
  <style>
    /* 基础重置样式 */
    * { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: var(--vscode-font-family);
      font-size: var(--vscode-font-size);
      background: var(--vscode-editor-background);
      color: var(--vscode-editor-foreground);
      display: flex;
      justify-content: center;
      padding: 24px;
    }

    sidebar-page {
      width: 100%;
    }
  </style>
</head>
<body>
  <sidebar-page id="app"></sidebar-page>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  protected getMessageHandlers(): Record<
    string,
    (message: BridgeMessage) => unknown | Promise<unknown>
  > {
    return {
      'panel.focus': () => {
        this.focus();
      },
      'panel.close': () => {
        this.dispose();
      },
      'action.copy': () => {
        if (this.currentResult) {
          void vscode.env.clipboard.writeText(this.currentResult.translation);
          void vscode.window.showInformationMessage('已复制到剪贴板');
        }
      },
      'action.replace': () => {
        // Replace is handled by command-side in simple mode; keep this as a no-op for now.
        void vscode.window.showInformationMessage('请使用"翻译并替换"命令进行替换');
      },
      'action.sendToSimple': () => {
        this.dispose();
      },
      'translate.request': async () => {
        return { pending: true };
      },
      'log.info': (message) => {
        console.log('[SidebarPanel]', (message.payload as any)?.message);
      },
      'log.error': (message) => {
        console.error('[SidebarPanel]', (message.payload as any)?.message);
      },
      'notification.show': async (message) => {
        try {
          const payload = message.payload || {};
          const text = payload.message || payload.text || '';
          const type = payload.type || 'info';
          console.log('[SidebarPanel] Notification received:', text, type);
          if (!text) return;
          if (type === 'error') {
            await vscode.window.showErrorMessage(String(text));
          } else if (type === 'warning') {
            await vscode.window.showWarningMessage(String(text));
          } else {
            await vscode.window.showInformationMessage(String(text));
          }
        } catch (err) {
          console.error('[SidebarPanel] Error showing notification:', err);
        }
      },
    };
  }

  updateResult(result: TranslationResult, originalText?: string): void {
    this.currentResult = result;
    if (originalText) {
      this.currentText = originalText;
    }
    this.isTranslating = false;

    this.sendMessage({
      type: 'translate.result',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      payload: { result: this.currentResult },
    });
  }

  showLoading(message?: string): void {
    this.isTranslating = true;
    this.currentResult = null;
    this.sendMessage({
      type: 'translate.start',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      payload: { message: message || '正在翻译...' },
    });
  }

  showError(error: string): void {
    this.sendMessage({
      type: 'translate.error',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      payload: { error },
    });
  }

  protected override onPanelVisible(): void {
    if (this.currentResult && !this.isTranslating) {
      this.updateResult(this.currentResult, this.currentText);
    }
  }

  prepareForTranslation(): void {
    this.isTranslating = true;
    this.currentResult = null;
  }
}

export class SidebarPanelManager extends BasePanelManager<SidebarPanelController> {
  private static instance: SidebarPanelManager | undefined;

  static getInstance(): SidebarPanelManager {
    if (!SidebarPanelManager.instance) {
      SidebarPanelManager.instance = new SidebarPanelManager();
    }
    return SidebarPanelManager.instance;
  }

  static reset(): void {
    SidebarPanelManager.instance?.disposeCurrentPanel();
    SidebarPanelManager.instance = undefined;
  }

  createOrShow(
    extensionUri: vscode.Uri,
    extensionContext: vscode.ExtensionContext,
  ): SidebarPanelController {
    if (this.currentPanel) {
      this.currentPanel.prepareForTranslation();
      this.currentPanel.show();
      return this.currentPanel;
    }

    const column = vscode.ViewColumn.Beside;

    const panel = vscode.window.createWebviewPanel('llmTranslation.sidebar', '翻译详情', column, {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [
        vscode.Uri.joinPath(extensionUri, 'out'),
        vscode.Uri.joinPath(extensionUri, 'node_modules'),
      ],
    });

    const ctrl = new SidebarPanelController(panel, extensionUri, extensionContext);
    this.setCurrentPanel(ctrl);
    return ctrl;
  }
}

export function getSidebarPanelManager(): SidebarPanelManager {
  return SidebarPanelManager.getInstance();
}

export function resetSidebarPanelManager(): void {
  SidebarPanelManager.reset();
}

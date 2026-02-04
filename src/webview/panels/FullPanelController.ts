import * as vscode from 'vscode';
import type { TranslationResult } from '../../types';
import { BasePanelController, BasePanelManager, type BridgeMessage } from './BasePanelController';

export class FullPanelController extends BasePanelController {
  private currentResult: TranslationResult | null = null;
  private currentText = '';

  protected getPanelConfig() {
    return {
      id: 'full-panel',
      title: '翻译详情',
      viewType: 'llmTranslation.full',
      retainContextWhenHidden: true,
    };
  }

  protected getHtmlContent(): string {
    const nonce = this.getNonce();
    const scriptUri = this.getResourceUri('views/full.js');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <title>翻译详情</title>
</head>
<body>
  <div class="container">
    <div id="app"></div>
  </div>

  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
  }

  protected getMessageHandlers(): Record<string, (message: BridgeMessage) => unknown | Promise<unknown>> {
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
        void vscode.window.showInformationMessage('请使用“翻译并替换”命令进行替换');
      },
      'action.sendToSimple': () => {
        this.dispose();
      },
      'translate.request': async () => {
        return { pending: true };
      },
      'log.info': (message) => {
        console.log('[FullPanel]', (message.payload as any)?.message);
      },
      'log.error': (message) => {
        console.error('[FullPanel]', (message.payload as any)?.message);
      },
      'notification.show': async (message) => {
        const { message: text, type } = (message.payload || {}) as any;
        if (!text) return;
        if (type === 'error') {
          await vscode.window.showErrorMessage(String(text));
        } else if (type === 'warning') {
          await vscode.window.showWarningMessage(String(text));
        } else {
          await vscode.window.showInformationMessage(String(text));
        }
      },
    };
  }

  updateResult(result: TranslationResult, originalText?: string): void {
    this.currentResult = result;
    if (originalText) {
      this.currentText = originalText;
    }

    this.sendMessage({
      type: 'translate.result',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      payload: { result: this.currentResult },
    });
  }

  showLoading(message?: string): void {
    this.sendMessage({
      type: 'translate.progress',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      payload: { progress: 0, message: message || '正在翻译...' },
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
    if (this.currentResult) {
      this.updateResult(this.currentResult, this.currentText);
    }
  }
}

export class FullPanelManager extends BasePanelManager<FullPanelController> {
  private static instance: FullPanelManager | undefined;

  static getInstance(): FullPanelManager {
    if (!FullPanelManager.instance) {
      FullPanelManager.instance = new FullPanelManager();
    }
    return FullPanelManager.instance;
  }

  static reset(): void {
    FullPanelManager.instance?.disposeCurrentPanel();
    FullPanelManager.instance = undefined;
  }

  createOrShow(extensionUri: vscode.Uri, extensionContext: vscode.ExtensionContext): FullPanelController {
    if (this.currentPanel) {
      this.currentPanel.show();
      return this.currentPanel;
    }

    const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;

    const panel = vscode.window.createWebviewPanel(
      'llmTranslation.full',
      '翻译详情',
      column,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'out'),
          vscode.Uri.joinPath(extensionUri, 'node_modules'),
        ],
      }
    );

    const ctrl = new FullPanelController(panel, extensionUri, extensionContext);
    this.setCurrentPanel(ctrl);
    return ctrl;
  }
}

export function getFullPanelManager(): FullPanelManager {
  return FullPanelManager.getInstance();
}

export function resetFullPanelManager(): void {
  FullPanelManager.reset();
}

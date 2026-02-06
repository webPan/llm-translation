import * as vscode from 'vscode';
import type { TranslationResult } from '../../types';
import { BasePanelController, BasePanelManager, type BridgeMessage } from './BasePanelController';

export interface SimplePanelCallbacks {
  onCopy?: () => void;
  onExpand?: () => void;
  onReplace?: () => void;
  onClose?: () => void;
}

export class SimplePanelController extends BasePanelController {
  private currentResult: (TranslationResult & { meta?: any }) | null = null;
  private callbacks: SimplePanelCallbacks = {};

  protected getPanelConfig() {
    return {
      id: 'simple-panel',
      title: '翻译结果',
      viewType: 'llmTranslation.simple',
      retainContextWhenHidden: false,
    };
  }

  protected getHtmlContent(): string {
    const nonce = this.getNonce();
    const scriptUri = this.getResourceUri('views/simple.js');
    const codiconUri = this.getResourceUri('views/styles/codicons/codicon.css');

    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline' ${this.panel.webview.cspSource}; font-src ${this.panel.webview.cspSource};">
  <title>翻译结果</title>
  <link rel="stylesheet" href="${codiconUri}" id="vscode-codicon-stylesheet">
</head>
<body>
  <div id="app">
    <p style="color: var(--vscode-descriptionForeground);">正在加载...</p>
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
        this.callbacks.onClose?.();
        this.dispose();
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
      'action.copy': () => {
        if (this.currentResult) {
          void vscode.env.clipboard.writeText(this.currentResult.translation);
        }
        this.callbacks.onCopy?.();
      },
      'action.expand': () => {
        this.callbacks.onExpand?.();
      },
      'action.replace': () => {
        this.callbacks.onReplace?.();
      },
      'action.selectAlternative': (message) => {
        const { index } = (message.payload || {}) as any;
        if (!this.currentResult?.alternatives?.length) return;
        const i = Number(index);
        if (!Number.isFinite(i)) return;
        const alt = this.currentResult.alternatives[i];
        if (typeof alt !== 'string') return;
        this.currentResult.translation = alt;
        this.renderResult();
      },
      'log.info': (message) => {
        console.log('[SimplePanel]', (message.payload as any)?.message);
      },
      'log.error': (message) => {
        console.error('[SimplePanel]', (message.payload as any)?.message);
      },
    };
  }

  showResult(result: TranslationResult, callbacks: SimplePanelCallbacks = {}): void {
    this.currentResult = {
      ...result,
      meta: {
        sourceLang: result.sourceLang,
        targetLang: result.targetLang,
        provider: result.provider,
        duration: result.duration,
      },
    };
    this.callbacks = callbacks;

    this.renderResult();
    this.show();
  }

  private renderResult(): void {
    if (!this.currentResult) return;

    this.sendMessage({
      type: 'translate.result',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      payload: {
        result: this.currentResult,
      },
    });
  }

  protected override onPanelVisible(): void {
    if (this.currentResult) {
      this.renderResult();
    }
  }
}

export class SimplePanelManager extends BasePanelManager<SimplePanelController> {
  private static instance: SimplePanelManager | undefined;

  static getInstance(): SimplePanelManager {
    if (!SimplePanelManager.instance) {
      SimplePanelManager.instance = new SimplePanelManager();
    }
    return SimplePanelManager.instance;
  }

  static reset(): void {
    SimplePanelManager.instance?.disposeCurrentPanel();
    SimplePanelManager.instance = undefined;
  }

  createOrShow(
    extensionUri: vscode.Uri,
    extensionContext: vscode.ExtensionContext,
    viewColumn: vscode.ViewColumn = vscode.ViewColumn.Beside
  ): SimplePanelController {
    if (this.currentPanel) {
      this.currentPanel.showInColumn(viewColumn, true);
      return this.currentPanel;
    }

    const panel = vscode.window.createWebviewPanel(
      'llmTranslation.simple',
      '翻译结果',
      viewColumn,
      {
        enableScripts: true,
        retainContextWhenHidden: false,
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, 'out'),
          vscode.Uri.joinPath(extensionUri, 'node_modules'),
        ],
      }
    );

    const ctrl = new SimplePanelController(panel, extensionUri, extensionContext);
    this.setCurrentPanel(ctrl);
    return ctrl;
  }

  showResult(
    extensionUri: vscode.Uri,
    extensionContext: vscode.ExtensionContext,
    result: TranslationResult,
    callbacks: SimplePanelCallbacks = {},
    viewColumn: vscode.ViewColumn = vscode.ViewColumn.Beside
  ): SimplePanelController {
    const panel = this.createOrShow(extensionUri, extensionContext, viewColumn);
    panel.showResult(result, callbacks);
    return panel;
  }
}

export function getSimplePanelManager(): SimplePanelManager {
  return SimplePanelManager.getInstance();
}

export function resetSimplePanelManager(): void {
  SimplePanelManager.reset();
}

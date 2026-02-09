import * as vscode from 'vscode';

export interface BridgeMessage<TPayload = any, TResponse = any> {
  type: string;
  id?: string;
  timestamp?: number;
  payload?: TPayload;
  response?: TResponse;
}

export type MessageHandler = (message: BridgeMessage) => unknown | Promise<unknown>;

export interface PanelConfig {
  id: string;
  title: string;
  viewType: string;
  retainContextWhenHidden?: boolean;
  enableScripts?: boolean;
  localResourceRoots?: vscode.Uri[];
}

export abstract class BasePanelController {
  protected readonly panel: vscode.WebviewPanel;
  protected readonly extensionUri: vscode.Uri;
  protected readonly extensionContext: vscode.ExtensionContext;

  private disposables: vscode.Disposable[] = [];

  constructor(
    panel: vscode.WebviewPanel,
    extensionUri: vscode.Uri,
    extensionContext: vscode.ExtensionContext,
  ) {
    this.panel = panel;
    this.extensionUri = extensionUri;
    this.extensionContext = extensionContext;

    this.setupWebview();
    this.setupMessageRouter();
    this.setupPanelListeners();

    this.sendInitMessage();
  }

  protected abstract getPanelConfig(): PanelConfig;
  protected abstract getHtmlContent(): string;
  protected abstract getMessageHandlers(): Record<string, MessageHandler>;

  protected onPanelVisible(): void {
    // Optional override
  }

  protected onPanelHidden(): void {
    // Optional override
  }

  protected setupWebview(): void {
    const config = this.getPanelConfig();

    this.panel.title = config.title;

    this.panel.webview.options = {
      enableScripts: config.enableScripts ?? true,
      localResourceRoots: config.localResourceRoots ?? [
        vscode.Uri.joinPath(this.extensionUri, 'out'),
        vscode.Uri.joinPath(this.extensionUri, 'node_modules'),
      ],
    };

    this.panel.webview.html = this.getHtmlContent();
  }

  protected updateWebview(): void {
    this.panel.webview.html = this.getHtmlContent();
  }

  protected getResourceUri(relativePath: string): vscode.Uri {
    // Resources live in: out/webview/<relativePath>
    const diskUri = vscode.Uri.joinPath(this.extensionUri, 'out', 'webview', relativePath);
    return this.panel.webview.asWebviewUri(diskUri);
  }

  protected getNonce(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let nonce = '';
    for (let i = 0; i < 32; i++) {
      nonce += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return nonce;
  }

  protected generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  protected sendMessage(message: BridgeMessage): void {
    void this.panel.webview.postMessage(message);
  }

  show(preserveFocus?: boolean): void {
    this.panel.reveal(this.panel.viewColumn, preserveFocus);
  }

  showInColumn(column: vscode.ViewColumn, preserveFocus?: boolean): void {
    this.panel.reveal(column, preserveFocus);
  }

  focus(): void {
    this.panel.reveal(undefined, true);
  }

  dispose(): void {
    this.disposables.forEach((d) => d.dispose());
    this.disposables = [];
    this.panel.dispose();
  }

  private setupPanelListeners(): void {
    this.panel.onDidChangeViewState(
      () => {
        if (this.panel.visible) {
          this.onPanelVisible();
        } else {
          this.onPanelHidden();
        }
      },
      undefined,
      this.disposables,
    );

    this.panel.onDidDispose(
      () => {
        this.dispose();
      },
      undefined,
      this.disposables,
    );
  }

  private setupMessageRouter(): void {
    const handlers = this.getMessageHandlers();

    const disposable = this.panel.webview.onDidReceiveMessage(async (data: unknown) => {
      const message = data as BridgeMessage;
      if (!message || typeof message.type !== 'string') return;

      const handler = handlers[message.type];
      if (!handler) return;

      try {
        const result = await handler(message);

        // For request/response flows (settings view), echo back { ...message, response }
        if (message.id !== undefined) {
          await this.panel.webview.postMessage({
            ...message,
            response: result,
          } satisfies BridgeMessage);
        }
      } catch (error) {
        if (message.id !== undefined) {
          const err = error instanceof Error ? error.message : String(error);
          await this.panel.webview.postMessage({
            ...message,
            response: { error: err },
          } satisfies BridgeMessage);
        }
      }
    });

    this.disposables.push(disposable);
  }

  private sendInitMessage(): void {
    const config = this.getPanelConfig();

    this.sendMessage({
      type: 'init',
      id: this.generateMessageId(),
      timestamp: Date.now(),
      payload: {
        panelId: config.id,
        viewType: config.viewType,
        vscodeVersion: vscode.version,
        extensionVersion: this.extensionContext.extension.packageJSON?.version ?? '0.0.0',
      },
    });
  }
}

export abstract class BasePanelManager<TPanel extends BasePanelController> {
  protected currentPanel: TPanel | undefined;

  protected setCurrentPanel(panel: TPanel): void {
    this.currentPanel = panel;

    const disposable = panel['panel'].onDidDispose(() => {
      if (this.currentPanel === panel) {
        this.currentPanel = undefined;
      }
      disposable.dispose();
    });
  }

  getCurrentPanel(): TPanel | undefined {
    return this.currentPanel;
  }

  disposeCurrentPanel(): void {
    this.currentPanel?.dispose();
    this.currentPanel = undefined;
  }
}

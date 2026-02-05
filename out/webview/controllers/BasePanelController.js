"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePanelManager = exports.BasePanelController = void 0;
const vscode = __importStar(require("vscode"));
class BasePanelController {
    constructor(panel, extensionUri, extensionContext) {
        this.disposables = [];
        this.panel = panel;
        this.extensionUri = extensionUri;
        this.extensionContext = extensionContext;
        this.setupWebview();
        this.setupMessageRouter();
        this.setupPanelListeners();
        this.sendInitMessage();
    }
    onPanelVisible() {
        // Optional override
    }
    onPanelHidden() {
        // Optional override
    }
    setupWebview() {
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
    updateWebview() {
        this.panel.webview.html = this.getHtmlContent();
    }
    getResourceUri(relativePath) {
        // Resources live in: out/webview/<relativePath>
        const diskUri = vscode.Uri.joinPath(this.extensionUri, 'out', 'webview', relativePath);
        return this.panel.webview.asWebviewUri(diskUri);
    }
    getNonce() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let nonce = '';
        for (let i = 0; i < 32; i++) {
            nonce += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return nonce;
    }
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    }
    sendMessage(message) {
        void this.panel.webview.postMessage(message);
    }
    show(preserveFocus) {
        this.panel.reveal(this.panel.viewColumn, preserveFocus);
    }
    focus() {
        this.panel.reveal(undefined, true);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
        this.disposables = [];
        this.panel.dispose();
    }
    setupPanelListeners() {
        this.panel.onDidChangeViewState(() => {
            if (this.panel.visible) {
                this.onPanelVisible();
            }
            else {
                this.onPanelHidden();
            }
        }, undefined, this.disposables);
        this.panel.onDidDispose(() => {
            this.dispose();
        }, undefined, this.disposables);
    }
    setupMessageRouter() {
        const handlers = this.getMessageHandlers();
        const disposable = this.panel.webview.onDidReceiveMessage(async (data) => {
            const message = data;
            if (!message || typeof message.type !== 'string')
                return;
            const handler = handlers[message.type];
            if (!handler)
                return;
            try {
                const result = await handler(message);
                // For request/response flows (settings view), echo back { ...message, response }
                if (message.id !== undefined) {
                    await this.panel.webview.postMessage({
                        ...message,
                        response: result,
                    });
                }
            }
            catch (error) {
                if (message.id !== undefined) {
                    const err = error instanceof Error ? error.message : String(error);
                    await this.panel.webview.postMessage({
                        ...message,
                        response: { error: err },
                    });
                }
            }
        });
        this.disposables.push(disposable);
    }
    sendInitMessage() {
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
exports.BasePanelController = BasePanelController;
class BasePanelManager {
    setCurrentPanel(panel) {
        this.currentPanel = panel;
        const disposable = panel['panel'].onDidDispose(() => {
            if (this.currentPanel === panel) {
                this.currentPanel = undefined;
            }
            disposable.dispose();
        });
    }
    getCurrentPanel() {
        return this.currentPanel;
    }
    disposeCurrentPanel() {
        this.currentPanel?.dispose();
        this.currentPanel = undefined;
    }
}
exports.BasePanelManager = BasePanelManager;
//# sourceMappingURL=BasePanelController.js.map
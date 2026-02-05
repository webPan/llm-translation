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
exports.FullPanelManager = exports.FullPanelController = void 0;
exports.getFullPanelManager = getFullPanelManager;
exports.resetFullPanelManager = resetFullPanelManager;
const vscode = __importStar(require("vscode"));
const BasePanelController_1 = require("./BasePanelController");
class FullPanelController extends BasePanelController_1.BasePanelController {
    constructor() {
        super(...arguments);
        this.currentResult = null;
        this.currentText = '';
    }
    getPanelConfig() {
        return {
            id: 'full-panel',
            title: '翻译详情',
            viewType: 'llmTranslation.full',
            retainContextWhenHidden: true,
        };
    }
    getHtmlContent() {
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
    getMessageHandlers() {
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
                console.log('[FullPanel]', message.payload?.message);
            },
            'log.error': (message) => {
                console.error('[FullPanel]', message.payload?.message);
            },
            'notification.show': async (message) => {
                const { message: text, type } = (message.payload || {});
                if (!text)
                    return;
                if (type === 'error') {
                    await vscode.window.showErrorMessage(String(text));
                }
                else if (type === 'warning') {
                    await vscode.window.showWarningMessage(String(text));
                }
                else {
                    await vscode.window.showInformationMessage(String(text));
                }
            },
        };
    }
    updateResult(result, originalText) {
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
    showLoading(message) {
        this.sendMessage({
            type: 'translate.progress',
            id: this.generateMessageId(),
            timestamp: Date.now(),
            payload: { progress: 0, message: message || '正在翻译...' },
        });
    }
    showError(error) {
        this.sendMessage({
            type: 'translate.error',
            id: this.generateMessageId(),
            timestamp: Date.now(),
            payload: { error },
        });
    }
    onPanelVisible() {
        if (this.currentResult) {
            this.updateResult(this.currentResult, this.currentText);
        }
    }
}
exports.FullPanelController = FullPanelController;
class FullPanelManager extends BasePanelController_1.BasePanelManager {
    static getInstance() {
        if (!FullPanelManager.instance) {
            FullPanelManager.instance = new FullPanelManager();
        }
        return FullPanelManager.instance;
    }
    static reset() {
        FullPanelManager.instance?.disposeCurrentPanel();
        FullPanelManager.instance = undefined;
    }
    createOrShow(extensionUri, extensionContext) {
        if (this.currentPanel) {
            this.currentPanel.show();
            return this.currentPanel;
        }
        const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;
        const panel = vscode.window.createWebviewPanel('llmTranslation.full', '翻译详情', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'out'),
                vscode.Uri.joinPath(extensionUri, 'node_modules'),
            ],
        });
        const ctrl = new FullPanelController(panel, extensionUri, extensionContext);
        this.setCurrentPanel(ctrl);
        return ctrl;
    }
}
exports.FullPanelManager = FullPanelManager;
function getFullPanelManager() {
    return FullPanelManager.getInstance();
}
function resetFullPanelManager() {
    FullPanelManager.reset();
}
//# sourceMappingURL=FullPanelController.js.map
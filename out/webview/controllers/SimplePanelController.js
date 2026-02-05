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
exports.SimplePanelManager = exports.SimplePanelController = void 0;
exports.getSimplePanelManager = getSimplePanelManager;
exports.resetSimplePanelManager = resetSimplePanelManager;
const vscode = __importStar(require("vscode"));
const BasePanelController_1 = require("./BasePanelController");
class SimplePanelController extends BasePanelController_1.BasePanelController {
    constructor() {
        super(...arguments);
        this.currentResult = null;
        this.callbacks = {};
    }
    getPanelConfig() {
        return {
            id: 'simple-panel',
            title: '翻译结果',
            viewType: 'llmTranslation.simple',
            retainContextWhenHidden: false,
        };
    }
    getHtmlContent() {
        const nonce = this.getNonce();
        const scriptUri = this.getResourceUri('views/simple.js');
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <title>翻译结果</title>
</head>
<body>
  <div id="app">
    <p style="color: var(--vscode-descriptionForeground);">正在加载...</p>
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
                this.callbacks.onClose?.();
                this.dispose();
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
                const { index } = (message.payload || {});
                if (!this.currentResult?.alternatives?.length)
                    return;
                const i = Number(index);
                if (!Number.isFinite(i))
                    return;
                const alt = this.currentResult.alternatives[i];
                if (typeof alt !== 'string')
                    return;
                this.currentResult.translation = alt;
                this.renderResult();
            },
            'log.info': (message) => {
                console.log('[SimplePanel]', message.payload?.message);
            },
            'log.error': (message) => {
                console.error('[SimplePanel]', message.payload?.message);
            },
        };
    }
    showResult(result, callbacks = {}) {
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
    renderResult() {
        if (!this.currentResult)
            return;
        this.sendMessage({
            type: 'translate.result',
            id: this.generateMessageId(),
            timestamp: Date.now(),
            payload: {
                result: this.currentResult,
            },
        });
    }
    onPanelVisible() {
        if (this.currentResult) {
            this.renderResult();
        }
    }
}
exports.SimplePanelController = SimplePanelController;
class SimplePanelManager extends BasePanelController_1.BasePanelManager {
    static getInstance() {
        if (!SimplePanelManager.instance) {
            SimplePanelManager.instance = new SimplePanelManager();
        }
        return SimplePanelManager.instance;
    }
    static reset() {
        SimplePanelManager.instance?.disposeCurrentPanel();
        SimplePanelManager.instance = undefined;
    }
    createOrShow(extensionUri, extensionContext) {
        if (this.currentPanel) {
            return this.currentPanel;
        }
        const panel = vscode.window.createWebviewPanel('llmTranslation.simple', '翻译结果', vscode.ViewColumn.Beside, {
            enableScripts: true,
            retainContextWhenHidden: false,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'out'),
                vscode.Uri.joinPath(extensionUri, 'node_modules'),
            ],
        });
        const ctrl = new SimplePanelController(panel, extensionUri, extensionContext);
        this.setCurrentPanel(ctrl);
        return ctrl;
    }
    showResult(extensionUri, extensionContext, result, callbacks = {}) {
        const panel = this.createOrShow(extensionUri, extensionContext);
        panel.showResult(result, callbacks);
        return panel;
    }
}
exports.SimplePanelManager = SimplePanelManager;
function getSimplePanelManager() {
    return SimplePanelManager.getInstance();
}
function resetSimplePanelManager() {
    SimplePanelManager.reset();
}
//# sourceMappingURL=SimplePanelController.js.map
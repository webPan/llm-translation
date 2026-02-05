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
exports.StatusBarManager = void 0;
exports.initStatusBar = initStatusBar;
exports.getStatusBar = getStatusBar;
exports.resetStatusBar = resetStatusBar;
const vscode = __importStar(require("vscode"));
class StatusBarManager {
    constructor(providerManager) {
        this.providerManager = providerManager;
        // 主状态栏项 - 显示当前提供商
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.statusBarItem.command = 'llm-translation.switchProvider';
        // 设置按钮 - 独立的齿轮图标
        this.settingsButtonItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.settingsButtonItem.text = '$(gear)';
        this.settingsButtonItem.command = 'llm-translation.openSettings';
        this.settingsButtonItem.tooltip = '打开 LLM Translation 设置';
        this.settingsButtonItem.show();
        this.update();
    }
    update() {
        const providers = this.providerManager.getAvailableProviders();
        const defaultProvider = this.providerManager.getDefaultProvider();
        const configuredProviders = providers.filter(p => p.configured);
        // Build status bar text
        const providerName = defaultProvider.name;
        const configuredCount = configuredProviders.length;
        if (configuredCount === 0) {
            this.statusBarItem.text = `$(warning) LLM 未配置`;
            this.statusBarItem.tooltip = '点击配置 API Key';
        }
        else {
            this.statusBarItem.text = `$(robot) LLM: ${providerName}`;
            this.statusBarItem.tooltip = `当前提供商: ${providerName}\n已配置: ${configuredCount} 个\n点击切换提供商`;
        }
        this.statusBarItem.show();
    }
    hide() {
        this.statusBarItem.hide();
        this.settingsButtonItem.hide();
    }
    dispose() {
        this.statusBarItem.dispose();
        this.settingsButtonItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;
// Singleton instance
let statusBarManager;
function initStatusBar(providerManager) {
    if (!statusBarManager) {
        statusBarManager = new StatusBarManager(providerManager);
    }
    return statusBarManager;
}
function getStatusBar() {
    return statusBarManager;
}
function resetStatusBar() {
    if (statusBarManager) {
        statusBarManager.dispose();
        statusBarManager = undefined;
    }
}
//# sourceMappingURL=statusBar.js.map
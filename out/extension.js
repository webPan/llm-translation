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
exports.getSettingsPanelManager = exports.getFullPanelManager = exports.getSimplePanelManager = void 0;
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const providers_1 = require("./providers");
const panels_1 = require("./webview/panels");
const translate_1 = require("./commands/translate");
const config_1 = require("./commands/config");
const promptManager_1 = require("./services/promptManager");
const parser_1 = require("./services/parser");
const statusBar_1 = require("./utils/statusBar");
// 导出面板管理器以供其他模块使用
var panels_2 = require("./webview/panels");
Object.defineProperty(exports, "getSimplePanelManager", { enumerable: true, get: function () { return panels_2.getSimplePanelManager; } });
Object.defineProperty(exports, "getFullPanelManager", { enumerable: true, get: function () { return panels_2.getFullPanelManager; } });
Object.defineProperty(exports, "getSettingsPanelManager", { enumerable: true, get: function () { return panels_2.getSettingsPanelManager; } });
function activate(context) {
    console.log('LLM Translation extension is now active!');
    // Initialize providers
    const providerManager = (0, providers_1.getProviderManager)(context);
    // Initialize status bar
    const statusBar = (0, statusBar_1.initStatusBar)(providerManager);
    context.subscriptions.push(statusBar);
    // Initialize panel managers
    const simplePanelManager = (0, panels_1.getSimplePanelManager)();
    const fullPanelManager = (0, panels_1.getFullPanelManager)();
    const settingsPanelManager = (0, panels_1.getSettingsPanelManager)(providerManager);
    // Register commands
    const translateDisposables = (0, translate_1.registerTranslateCommands)(context, providerManager, simplePanelManager, fullPanelManager);
    const configDisposables = (0, config_1.registerConfigCommands)(context, providerManager, settingsPanelManager);
    // Add all disposables to context
    context.subscriptions.push(...translateDisposables, ...configDisposables, {
        dispose: () => {
            (0, providers_1.resetProviderManager)();
            (0, panels_1.resetSimplePanelManager)();
            (0, panels_1.resetFullPanelManager)();
            (0, panels_1.resetSettingsPanelManager)();
            (0, promptManager_1.resetPromptManager)();
            (0, parser_1.resetResultParser)();
            (0, statusBar_1.resetStatusBar)();
        },
    });
    // Watch configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration((e) => {
        if (e.affectsConfiguration('llmTranslation.providers')) {
            providerManager.reloadProviders();
            statusBar.update();
            settingsPanelManager.updateProviders();
        }
        if (e.affectsConfiguration('llmTranslation.defaultProvider')) {
            statusBar.update();
        }
    });
    context.subscriptions.push(configWatcher);
    // Show welcome message on first activation
    showWelcomeMessage(context);
}
function deactivate() {
    console.log('LLM Translation extension is now deactivated!');
    (0, providers_1.resetProviderManager)();
    (0, panels_1.resetSimplePanelManager)();
    (0, panels_1.resetFullPanelManager)();
    (0, panels_1.resetSettingsPanelManager)();
    (0, statusBar_1.resetStatusBar)();
}
async function showWelcomeMessage(context) {
    const hasShownWelcome = context.globalState.get('hasShownWelcome', false);
    if (!hasShownWelcome) {
        const result = await vscode.window.showInformationMessage('欢迎使用 LLM Translation！请先配置 API Key 开始使用。', '配置 API Key', '查看文档', '不再提醒');
        if (result === '配置 API Key') {
            vscode.commands.executeCommand('llm-translation.setApiKey');
        }
        else if (result === '查看文档') {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/your-repo/llm-translation#readme'));
        }
        else if (result === '不再提醒') {
            await context.globalState.update('hasShownWelcome', true);
        }
    }
}
//# sourceMappingURL=extension.js.map
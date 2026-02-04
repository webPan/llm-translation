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
exports.registerConfigCommands = registerConfigCommands;
const vscode = __importStar(require("vscode"));
function registerConfigCommands(context, providerManager, settingsPanelManager) {
    const disposables = [];
    disposables.push(vscode.commands.registerCommand('llm-translation.openSettings', () => {
        settingsPanelManager.createOrShow(context.extensionUri, context);
    }));
    disposables.push(vscode.commands.registerCommand('llm-translation.toggleDisplayMode', async () => {
        const config = vscode.workspace.getConfiguration('llmTranslation');
        const currentMode = config.get('displayMode', 'simple');
        const newMode = currentMode === 'simple' ? 'normal' : 'simple';
        await config.update('displayMode', newMode, true);
        vscode.window.showInformationMessage(`已切换到${newMode === 'simple' ? '简版' : '正常'}模式`);
    }));
    disposables.push(vscode.commands.registerCommand('llm-translation.switchProvider', async () => {
        const providers = providerManager.getAvailableProviders();
        const configuredProviders = providers.filter(p => p.configured);
        if (configuredProviders.length === 0) {
            const action = await vscode.window.showErrorMessage('没有可用的翻译提供商，请先配置 API Key', '打开设置');
            if (action === '打开设置') {
                vscode.commands.executeCommand('llm-translation.openSettings');
            }
            return;
        }
        const items = providers.map(p => ({
            label: p.name,
            description: p.configured ? '已配置' : '未配置',
            detail: p.id,
            picked: false,
        }));
        const selected = await vscode.window.showQuickPick(items, {
            placeHolder: '选择默认翻译提供商',
        });
        if (selected) {
            const config = vscode.workspace.getConfiguration('llmTranslation');
            await config.update('defaultProvider', selected.detail, true);
            vscode.window.showInformationMessage(`已切换到 ${selected.label}`);
        }
    }));
    // Command to quickly set API key
    disposables.push(vscode.commands.registerCommand('llm-translation.setApiKey', async () => {
        const providers = [
            { id: 'deepseek', name: 'DeepSeek' },
            { id: 'qwen', name: '千问 (Qwen)' },
            { id: 'kimi', name: 'Kimi' },
            { id: 'glm', name: '智谱 GLM' },
        ];
        const selected = await vscode.window.showQuickPick(providers.map(p => ({ label: p.name, detail: p.id })), { placeHolder: '选择要配置 API Key 的提供商' });
        if (!selected)
            return;
        const apiKey = await vscode.window.showInputBox({
            prompt: `请输入 ${selected.label} 的 API Key`,
            password: true,
            ignoreFocusOut: true,
            validateInput: (value) => {
                if (!value || value.trim().length === 0) {
                    return 'API Key 不能为空';
                }
                return null;
            },
        });
        if (apiKey) {
            const config = vscode.workspace.getConfiguration('llmTranslation');
            await config.update(`providers.${selected.detail}.apiKey`, apiKey, true);
            vscode.window.showInformationMessage(`${selected.label} API Key 已保存`);
            // Reload providers to apply new config
            providerManager.reloadProviders();
            // Update settings panel if open
            settingsPanelManager.updateProviders();
        }
    }));
    return disposables;
}
//# sourceMappingURL=config.js.map
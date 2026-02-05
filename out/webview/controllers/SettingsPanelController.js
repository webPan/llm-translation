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
exports.SettingsPanelManager = exports.SettingsPanelController = void 0;
exports.getSettingsPanelManager = getSettingsPanelManager;
exports.resetSettingsPanelManager = resetSettingsPanelManager;
const vscode = __importStar(require("vscode"));
const promptManager_1 = require("../../services/promptManager");
const BasePanelController_1 = require("./BasePanelController");
/**
 * 设置面板控制器
 *
 * 职责：
 * - 管理 WebviewPanel 生命周期
 * - 提供 HTML 入口（引用 views/settings.js）
 * - 处理来自 Webview 的消息请求
 *
 * 注意：不包含业务 UI 代码，UI 逻辑在 views/settings.ts 中
 */
class SettingsPanelController extends BasePanelController_1.BasePanelController {
    constructor(panel, extensionUri, extensionContext, providerManager) {
        super(panel, extensionUri, extensionContext);
        this.providerManager = providerManager;
    }
    getPanelConfig() {
        return {
            id: 'settings-panel',
            title: 'LLM Translation 设置',
            viewType: 'llmTranslation.settings',
            retainContextWhenHidden: true,
        };
    }
    /**
     * 返回 HTML 骨架，仅引用编译后的 JS
     * UI 内容由 views/settings.ts 动态创建
     */
    getHtmlContent() {
        const nonce = this.getNonce();
        const scriptUri = this.getResourceUri('views/settings.js');
        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline';">
  <title>LLM Translation 设置</title>
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
    }

    settings-page {
      width: 100%;
    }
  </style>
</head>
<body>
  <settings-page id="app"></settings-page>
  <script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`;
    }
    /**
     * 注册消息处理器
     * 处理来自 Webview 的请求
     */
    getMessageHandlers() {
        return {
            // 面板控制
            'panel.focus': () => {
                this.focus();
            },
            'panel.close': () => {
                this.dispose();
            },
            // 通知
            'notification.show': async (message) => {
                const { message: text, type } = (message.payload || {});
                if (!text)
                    return;
                const msgText = String(text);
                switch (type) {
                    case 'error':
                        await vscode.window.showErrorMessage(msgText);
                        break;
                    case 'warning':
                        await vscode.window.showWarningMessage(msgText);
                        break;
                    default:
                        await vscode.window.showInformationMessage(msgText);
                }
            },
            // 配置读取
            'config.get': async (message) => {
                const { key } = (message.payload || {});
                const config = vscode.workspace.getConfiguration('llmTranslation');
                if (key) {
                    return config.get(key);
                }
                // 返回常用配置
                return {
                    defaultProvider: config.get('defaultProvider', 'deepseek'),
                    displayMode: config.get('displayMode', 'simple'),
                    defaultTargetLang: config.get('defaultTargetLang', 'zh'),
                    defaultPromptTemplate: config.get('defaultPromptTemplate', 'default'),
                };
            },
            // 配置更新
            'config.update': async (message) => {
                const { key, value, scope = 'user' } = (message.payload || {});
                const config = vscode.workspace.getConfiguration('llmTranslation');
                const target = scope === 'workspace'
                    ? vscode.ConfigurationTarget.Workspace
                    : vscode.ConfigurationTarget.Global;
                await config.update(key, value, target);
                return { success: true };
            },
            // 获取服务商配置
            'config.providers.get': async () => {
                const providers = this.providerManager.getAvailableProviders();
                const config = vscode.workspace.getConfiguration('llmTranslation');
                const defaultProvider = config.get('defaultProvider', 'deepseek');
                const providersConfig = {};
                for (const p of providers) {
                    const baseUrl = config.get(`providers.${p.id}.baseUrl`, '');
                    providersConfig[p.id] = {
                        id: p.id,
                        name: p.name,
                        apiKey: config.get(`providers.${p.id}.apiKey`, ''),
                        model: config.get(`providers.${p.id}.model`, ''),
                        baseUrl,
                        apiEndpoint: baseUrl,
                        configured: p.configured,
                    };
                }
                return { providers: providersConfig, defaultProvider };
            },
            // 更新服务商配置
            'config.providers.update': async (message) => {
                const { providerId, config: newConfig } = (message.payload || {});
                if (!providerId)
                    return { success: false, error: 'Missing providerId' };
                const config = vscode.workspace.getConfiguration('llmTranslation');
                if (newConfig?.apiKey !== undefined) {
                    await config.update(`providers.${providerId}.apiKey`, newConfig.apiKey, true);
                }
                if (newConfig?.model !== undefined) {
                    await config.update(`providers.${providerId}.model`, newConfig.model, true);
                }
                if (newConfig?.baseUrl !== undefined) {
                    await config.update(`providers.${providerId}.baseUrl`, newConfig.baseUrl, true);
                }
                if (newConfig?.apiEndpoint !== undefined) {
                    // 向后兼容：settings.js 使用 apiEndpoint 字段
                    await config.update(`providers.${providerId}.baseUrl`, newConfig.apiEndpoint, true);
                }
                this.providerManager.reloadProviders();
                return { success: true };
            },
            // 获取模板列表
            'config.templates.get': async () => {
                const promptManager = (0, promptManager_1.getPromptManager)();
                const templates = promptManager.getAllTemplates();
                const defaultId = promptManager.getDefaultTemplateId();
                return {
                    templates: templates.map(t => ({
                        id: t.id,
                        name: t.name,
                        description: t.description,
                        template: t.template,
                        isBuiltin: !t.id.startsWith('custom-')
                    })),
                    defaultId
                };
            },
            // 保存模板
            'config.templates.save': async (message) => {
                const { template } = (message.payload || {});
                if (!template)
                    return { success: false, error: 'Missing template' };
                const promptManager = (0, promptManager_1.getPromptManager)();
                const existing = promptManager.getTemplate(template.id);
                if (existing && !template.id.startsWith('custom-')) {
                    return { success: false, error: '不能修改内置模板' };
                }
                if (template.id.startsWith('custom-')) {
                    await promptManager.updateCustomTemplate(template);
                }
                else {
                    await promptManager.addCustomTemplate(template);
                }
                return { success: true };
            },
            // 删除模板
            'config.templates.delete': async (message) => {
                const { id } = (message.payload || {});
                if (!id)
                    return { success: false, error: 'Missing id' };
                if (!id.startsWith('custom-')) {
                    return { success: false, error: '不能删除内置模板' };
                }
                const promptManager = (0, promptManager_1.getPromptManager)();
                await promptManager.deleteCustomTemplate(id);
                return { success: true };
            },
            // 设置默认模板
            'config.templates.setDefault': async (message) => {
                const { id } = (message.payload || {});
                if (!id)
                    return { success: false, error: 'Missing id' };
                const promptManager = (0, promptManager_1.getPromptManager)();
                await promptManager.setDefaultTemplate(id);
                return { success: true };
            },
            // 导出模板
            'config.templates.export': async () => {
                const promptManager = (0, promptManager_1.getPromptManager)();
                const json = promptManager.exportTemplates();
                return { templates: json };
            },
            // 导入模板
            'config.templates.import': async (message) => {
                const { json } = (message.payload || {});
                if (!json)
                    return { success: false, error: 'Missing json' };
                const promptManager = (0, promptManager_1.getPromptManager)();
                await promptManager.importTemplates(json);
                return { success: true };
            },
            // 日志
            'log.info': (message) => {
                console.log('[SettingsPanel]', message.payload?.message);
            },
            'log.error': (message) => {
                console.error('[SettingsPanel]', message.payload?.message);
            },
        };
    }
    refreshProviders() {
        this.sendMessage({
            type: 'config.providers.refresh',
            timestamp: Date.now(),
            payload: {},
        });
    }
    refreshTemplates() {
        this.sendMessage({
            type: 'config.templates.refresh',
            timestamp: Date.now(),
            payload: {},
        });
    }
    onPanelVisible() {
        this.refreshProviders();
        this.refreshTemplates();
    }
}
exports.SettingsPanelController = SettingsPanelController;
/**
 * 设置面板管理器（单例）
 */
class SettingsPanelManager extends BasePanelController_1.BasePanelManager {
    constructor(providerManager) {
        super();
        this.providerManager = providerManager;
    }
    static getInstance(providerManager) {
        if (!SettingsPanelManager.instance) {
            SettingsPanelManager.instance = new SettingsPanelManager(providerManager);
        }
        return SettingsPanelManager.instance;
    }
    static reset() {
        SettingsPanelManager.instance?.disposeCurrentPanel();
        SettingsPanelManager.instance = undefined;
    }
    createOrShow(extensionUri, extensionContext) {
        if (this.currentPanel) {
            this.currentPanel.show();
            return this.currentPanel;
        }
        const column = vscode.window.activeTextEditor?.viewColumn ?? vscode.ViewColumn.One;
        const panel = vscode.window.createWebviewPanel('llmTranslation.settings', 'LLM Translation 设置', column, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(extensionUri, 'out'),
                vscode.Uri.joinPath(extensionUri, 'node_modules'),
            ],
        });
        const ctrl = new SettingsPanelController(panel, extensionUri, extensionContext, this.providerManager);
        this.setCurrentPanel(ctrl);
        return ctrl;
    }
    updateProviders() {
        this.currentPanel?.refreshProviders();
    }
}
exports.SettingsPanelManager = SettingsPanelManager;
function getSettingsPanelManager(providerManager) {
    return SettingsPanelManager.getInstance(providerManager);
}
function resetSettingsPanelManager() {
    SettingsPanelManager.reset();
}
//# sourceMappingURL=SettingsPanelController.js.map
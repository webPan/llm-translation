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
exports.ProviderManager = void 0;
exports.getProviderManager = getProviderManager;
exports.resetProviderManager = resetProviderManager;
const vscode = __importStar(require("vscode"));
const deepseek_1 = require("./deepseek");
const qwen_1 = require("./qwen");
const kimi_1 = require("./kimi");
const glm_1 = require("./glm");
class ProviderManager {
    constructor(context) {
        this.providers = new Map();
        this.context = context;
        this.initializeProviders();
    }
    initializeProviders() {
        const config = vscode.workspace.getConfiguration('llmTranslation');
        // Initialize DeepSeek
        const deepseekConfig = {
            id: 'deepseek',
            name: 'DeepSeek',
            apiKey: config.get('providers.deepseek.apiKey', ''),
            model: config.get('providers.deepseek.model', 'deepseek-chat'),
            baseUrl: config.get('providers.deepseek.baseUrl', 'https://api.deepseek.com'),
        };
        this.providers.set('deepseek', new deepseek_1.DeepSeekProvider(deepseekConfig));
        // Initialize Qwen (千问)
        const qwenConfig = {
            id: 'qwen',
            name: '千问 (Qwen)',
            apiKey: config.get('providers.qwen.apiKey', ''),
            model: config.get('providers.qwen.model', 'qwen-turbo'),
            baseUrl: config.get('providers.qwen.baseUrl', 'https://dashscope.aliyuncs.com/api/v1'),
        };
        this.providers.set('qwen', new qwen_1.QwenProvider(qwenConfig));
        // Initialize Kimi
        const kimiConfig = {
            id: 'kimi',
            name: 'Kimi',
            apiKey: config.get('providers.kimi.apiKey', ''),
            model: config.get('providers.kimi.model', 'moonshot-v1-8k'),
            baseUrl: config.get('providers.kimi.baseUrl', 'https://api.moonshot.cn/v1'),
        };
        this.providers.set('kimi', new kimi_1.KimiProvider(kimiConfig));
        // Initialize GLM (智谱)
        const glmConfig = {
            id: 'glm',
            name: '智谱 GLM',
            apiKey: config.get('providers.glm.apiKey', ''),
            model: config.get('providers.glm.model', 'glm-4'),
            baseUrl: config.get('providers.glm.baseUrl', 'https://open.bigmodel.cn/api/paas/v4'),
        };
        this.providers.set('glm', new glm_1.GlmProvider(glmConfig));
    }
    getProvider(id) {
        return this.providers.get(id);
    }
    getDefaultProvider() {
        const config = vscode.workspace.getConfiguration('llmTranslation');
        const defaultProviderId = config.get('defaultProvider', 'deepseek');
        const provider = this.providers.get(defaultProviderId);
        if (!provider) {
            throw new Error(`未找到 Provider: ${defaultProviderId}`);
        }
        return provider;
    }
    async translateWithDefault(text, options) {
        const provider = this.getDefaultProvider();
        if (!provider.validateConfig()) {
            const action = await vscode.window.showErrorMessage(`${provider.name} API Key 未配置，请先配置 API Key`, '打开设置');
            if (action === '打开设置') {
                vscode.commands.executeCommand('llm-translation.openSettings');
            }
            throw new Error('API Key 未配置');
        }
        return provider.translate(text, { ...options, text });
    }
    reloadProviders() {
        this.providers.clear();
        this.initializeProviders();
    }
    getAvailableProviders() {
        return Array.from(this.providers.entries()).map(([id, provider]) => ({
            id,
            name: provider.name,
            configured: provider.validateConfig(),
        }));
    }
}
exports.ProviderManager = ProviderManager;
// Singleton instance
let providerManager;
function getProviderManager(context) {
    if (!providerManager) {
        providerManager = new ProviderManager(context);
    }
    return providerManager;
}
function resetProviderManager() {
    providerManager = undefined;
}
//# sourceMappingURL=index.js.map
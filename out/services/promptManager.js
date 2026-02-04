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
exports.PromptManager = void 0;
exports.getPromptManager = getPromptManager;
exports.resetPromptManager = resetPromptManager;
const vscode = __importStar(require("vscode"));
// Built-in prompt templates
const BUILTIN_TEMPLATES = [
    {
        id: 'default',
        name: '标准翻译',
        description: '通用翻译模板，提供准确自然的翻译',
        template: `请将以下文本从 {sourceLang} 翻译为 {targetLang}：

{text}

请以 JSON 格式返回：
{
  "translation": "主要翻译结果",
  "pronunciation": "发音（如适用）",
  "alternatives": ["替代翻译1", "替代翻译2"],
  "explanations": [
    {"word": "关键词", "meaning": "释义", "pos": "词性"}
  ],
  "examples": [
    {"original": "例句原文", "translation": "例句翻译"}
  ]
}`,
    },
    {
        id: 'academic',
        name: '学术翻译',
        description: '适合学术论文、技术文档的正式翻译',
        template: `你是一位专业学术翻译专家。请将以下学术文本从 {sourceLang} 翻译为 {targetLang}，保持学术严谨性和专业术语的准确性：

{text}

请以 JSON 格式返回：
{
  "translation": "学术翻译结果，使用正式术语",
  "pronunciation": "",
  "alternatives": ["备选学术表达1", "备选学术表达2"],
  "explanations": [
    {"word": "专业术语", "meaning": "术语解释", "pos": "词性"}
  ],
  "examples": []
}`,
    },
    {
        id: 'casual',
        name: '口语翻译',
        description: '适合日常对话、口语化表达的翻译',
        template: `请将以下口语化文本从 {sourceLang} 翻译为 {targetLang}，使用自然、地道的口语表达：

{text}

请以 JSON 格式返回：
{
  "translation": "口语化翻译结果",
  "pronunciation": "发音",
  "alternatives": ["更随意的说法", "更礼貌的说法"],
  "explanations": [
    {"word": "口语表达", "meaning": "解释说明", "pos": ""}
  ],
  "examples": [
    {"original": "日常例句", "translation": "中文翻译"}
  ]
}`,
    },
    {
        id: 'code',
        name: '代码注释翻译',
        description: '适合翻译代码注释和文档',
        template: `你是一位程序员。请将以下代码注释/文档从 {sourceLang} 翻译为 {targetLang}，保持技术术语准确，代码示例不翻译：

{text}

请以 JSON 格式返回：
{
  "translation": "技术翻译结果",
  "pronunciation": "",
  "alternatives": [],
  "explanations": [
    {"word": "技术术语", "meaning": "技术解释", "pos": ""}
  ],
  "examples": []
}`,
    },
];
class PromptManager {
    // Get all available templates (built-in + custom)
    getAllTemplates() {
        const customTemplates = this.getCustomTemplates();
        return [...BUILTIN_TEMPLATES, ...customTemplates];
    }
    // Get built-in templates
    getBuiltinTemplates() {
        return [...BUILTIN_TEMPLATES];
    }
    // Get custom templates from configuration
    getCustomTemplates() {
        const config = vscode.workspace.getConfiguration();
        return config.get(PromptManager.CUSTOM_TEMPLATES_KEY, []);
    }
    // Get default template ID
    getDefaultTemplateId() {
        const config = vscode.workspace.getConfiguration();
        return config.get(PromptManager.DEFAULT_TEMPLATE_KEY, 'default');
    }
    // Get a template by ID
    getTemplate(id) {
        return this.getAllTemplates().find(t => t.id === id);
    }
    // Build prompt with variables replaced
    buildPrompt(templateId, text, sourceLang, targetLang) {
        const template = this.getTemplate(templateId);
        if (!template) {
            // Fallback to default template
            return this.buildPrompt('default', text, sourceLang, targetLang);
        }
        const langNames = {
            'zh': '中文',
            'en': '英文',
            'ja': '日文',
            'auto': '自动检测语言',
        };
        return template.template
            .replace(/\{text\}/g, text)
            .replace(/\{sourceLang\}/g, langNames[sourceLang] || sourceLang)
            .replace(/\{targetLang\}/g, langNames[targetLang] || targetLang);
    }
    // Add a custom template
    async addCustomTemplate(template) {
        const customTemplates = this.getCustomTemplates();
        const newTemplate = {
            ...template,
            id: `custom-${Date.now()}`,
        };
        const config = vscode.workspace.getConfiguration();
        await config.update(PromptManager.CUSTOM_TEMPLATES_KEY, [...customTemplates, newTemplate], true);
    }
    // Update a custom template
    async updateCustomTemplate(template) {
        const customTemplates = this.getCustomTemplates();
        const index = customTemplates.findIndex(t => t.id === template.id);
        if (index === -1) {
            throw new Error('模板不存在');
        }
        customTemplates[index] = template;
        const config = vscode.workspace.getConfiguration();
        await config.update(PromptManager.CUSTOM_TEMPLATES_KEY, customTemplates, true);
    }
    // Delete a custom template
    async deleteCustomTemplate(id) {
        const customTemplates = this.getCustomTemplates();
        const filtered = customTemplates.filter(t => t.id !== id);
        const config = vscode.workspace.getConfiguration();
        await config.update(PromptManager.CUSTOM_TEMPLATES_KEY, filtered, true);
    }
    // Set default template
    async setDefaultTemplate(id) {
        const config = vscode.workspace.getConfiguration();
        await config.update(PromptManager.DEFAULT_TEMPLATE_KEY, id, true);
    }
    // Export templates to JSON
    exportTemplates() {
        return JSON.stringify(this.getAllTemplates(), null, 2);
    }
    // Import templates from JSON
    async importTemplates(json) {
        try {
            const templates = JSON.parse(json);
            const validTemplates = templates.filter(t => t.id && t.name && t.template &&
                !BUILTIN_TEMPLATES.some(bt => bt.id === t.id));
            const config = vscode.workspace.getConfiguration();
            await config.update(PromptManager.CUSTOM_TEMPLATES_KEY, validTemplates, true);
        }
        catch (error) {
            throw new Error('导入模板失败：无效的 JSON 格式');
        }
    }
    // Get available variables for templates
    getAvailableVariables() {
        return [
            { name: '{text}', description: '要翻译的文本' },
            { name: '{sourceLang}', description: '源语言名称' },
            { name: '{targetLang}', description: '目标语言名称' },
        ];
    }
}
exports.PromptManager = PromptManager;
PromptManager.CUSTOM_TEMPLATES_KEY = 'llmTranslation.customPromptTemplates';
PromptManager.DEFAULT_TEMPLATE_KEY = 'llmTranslation.defaultPromptTemplate';
// Singleton instance
let promptManager;
function getPromptManager() {
    if (!promptManager) {
        promptManager = new PromptManager();
    }
    return promptManager;
}
function resetPromptManager() {
    promptManager = undefined;
}
//# sourceMappingURL=promptManager.js.map
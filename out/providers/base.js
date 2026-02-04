"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseProvider = void 0;
const axios_1 = __importDefault(require("axios"));
const promptManager_1 = require("../services/promptManager");
const parser_1 = require("../services/parser");
class BaseProvider {
    constructor(config) {
        this.config = {
            temperature: 0.7,
            maxTokens: 2048,
            ...config,
        };
        this.client = axios_1.default.create({
            baseURL: this.config.baseUrl,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
            },
        });
        // Add request interceptor for auth
        this.client.interceptors.request.use((config) => {
            config.headers.Authorization = this.getAuthHeader();
            return config;
        }, (error) => Promise.reject(error));
    }
    getDefaultSystemPrompt(targetLang) {
        const langMap = {
            'zh': '中文',
            'en': '英文',
            'ja': '日文',
        };
        return `You are a professional translator. Translate the user's text to ${langMap[targetLang] || targetLang}. 
Provide a natural, accurate translation. 
Respond in JSON format:
{
  "translation": "the main translation",
  "pronunciation": "phonetic transcription if applicable",
  "alternatives": ["alternative translation 1", "alternative translation 2"]
}`;
    }
    buildMessages(text, sourceLang, targetLang, promptTemplate) {
        // Use prompt manager to build the prompt
        const promptManager = (0, promptManager_1.getPromptManager)();
        const userContent = promptManager.buildPrompt(promptTemplate || 'default', text, sourceLang, targetLang);
        return [
            {
                role: 'system',
                content: 'You are a professional translator. Follow the user\'s instructions carefully.',
            },
            {
                role: 'user',
                content: userContent,
            },
        ];
    }
    async makeRequest(request) {
        const startTime = Date.now();
        try {
            const response = await this.client.post('/chat/completions', request);
            return {
                data: response.data,
                duration: Date.now() - startTime,
            };
        }
        catch (error) {
            this.handleError(error);
            throw error;
        }
    }
    handleError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            switch (status) {
                case 401:
                    throw new Error(`API Key 无效或已过期，请检查 ${this.name} 的 API Key 设置`);
                case 429:
                    throw new Error('请求过于频繁，请稍后再试');
                case 500:
                case 502:
                case 503:
                    throw new Error(`${this.name} 服务暂时不可用，请稍后再试`);
                default:
                    throw new Error(data?.error?.message || `请求失败: ${status}`);
            }
        }
        else if (error.request) {
            throw new Error('网络请求失败，请检查网络连接');
        }
        else {
            throw new Error(`请求错误: ${error.message}`);
        }
    }
    parseJsonResponse(content) {
        try {
            // Try to extract JSON from markdown code block
            const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[1].trim());
            }
            // Try to parse the whole content as JSON
            return JSON.parse(content);
        }
        catch {
            // Return a simple object with the content as translation
            return {
                translation: content.trim(),
                alternatives: [],
            };
        }
    }
    createResult(original, content, sourceLang, targetLang, duration) {
        // Use result parser to parse the response
        const parser = (0, parser_1.getResultParser)();
        return parser.parse(content, original, sourceLang, targetLang, this.name, this.config.model || 'unknown', duration);
    }
}
exports.BaseProvider = BaseProvider;
//# sourceMappingURL=base.js.map
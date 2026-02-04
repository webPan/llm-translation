"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenProvider = void 0;
const base_1 = require("./base");
class QwenProvider extends base_1.BaseProvider {
    constructor(config) {
        super({
            baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
            ...config,
        });
        this.id = 'qwen';
        this.name = '千问';
        if (!this.config.model) {
            this.config.model = 'qwen-turbo';
        }
    }
    validateConfig() {
        return !!this.config.apiKey && this.config.apiKey.length > 0;
    }
    getAuthHeader() {
        return `Bearer ${this.config.apiKey}`;
    }
    buildRequest(messages) {
        // Qwen uses a different message format
        return {
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
        };
    }
    parseResponse(response) {
        // Qwen response format
        return response.output?.text ||
            response.output?.choices?.[0]?.message?.content ||
            response.choices?.[0]?.message?.content ||
            '';
    }
    async translate(text, options) {
        if (!this.validateConfig()) {
            throw new Error('千问 (Qwen) API Key 未配置');
        }
        const messages = this.buildMessages(text, options.sourceLang, options.targetLang, options.promptTemplate);
        const request = this.buildRequest(messages);
        const { data, duration } = await this.makeRequest(request);
        const content = this.parseResponse(data);
        return this.createResult(text, content, options.sourceLang, options.targetLang, duration);
    }
    async makeRequest(request) {
        const startTime = Date.now();
        try {
            // Qwen API endpoint is different
            const response = await this.client.post('/services/aigc/text-generation/generation', {
                model: request.model,
                input: {
                    messages: request.messages,
                },
                parameters: {
                    temperature: request.temperature,
                    max_tokens: request.max_tokens,
                    result_format: 'message',
                },
            });
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
}
exports.QwenProvider = QwenProvider;
//# sourceMappingURL=qwen.js.map
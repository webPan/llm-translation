"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeepSeekProvider = void 0;
const base_1 = require("./base");
class DeepSeekProvider extends base_1.BaseProvider {
    constructor(config) {
        super({
            baseUrl: 'https://api.deepseek.com',
            ...config,
        });
        this.id = 'deepseek';
        this.name = 'DeepSeek';
        // Set default model if not provided
        if (!this.config.model) {
            this.config.model = 'deepseek-chat';
        }
    }
    validateConfig() {
        return !!this.config.apiKey && this.config.apiKey.length > 0;
    }
    getAuthHeader() {
        return `Bearer ${this.config.apiKey}`;
    }
    buildRequest(messages) {
        return {
            model: this.config.model,
            messages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
        };
    }
    parseResponse(response) {
        return response.choices?.[0]?.message?.content || '';
    }
    async translate(text, options) {
        if (!this.validateConfig()) {
            throw new Error('DeepSeek API Key 未配置');
        }
        const messages = this.buildMessages(text, options.sourceLang, options.targetLang, options.promptTemplate);
        const request = this.buildRequest(messages);
        const { data, duration } = await this.makeRequest(request);
        const content = this.parseResponse(data);
        return this.createResult(text, content, options.sourceLang, options.targetLang, duration);
    }
}
exports.DeepSeekProvider = DeepSeekProvider;
//# sourceMappingURL=deepseek.js.map
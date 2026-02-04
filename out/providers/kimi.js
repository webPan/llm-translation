"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KimiProvider = void 0;
const base_1 = require("./base");
class KimiProvider extends base_1.BaseProvider {
    constructor(config) {
        super({
            baseUrl: 'https://api.moonshot.cn/v1',
            ...config,
        });
        this.id = 'kimi';
        this.name = 'Kimi';
        if (!this.config.model) {
            this.config.model = 'moonshot-v1-8k';
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
            throw new Error('Kimi API Key 未配置');
        }
        const messages = this.buildMessages(text, options.sourceLang, options.targetLang, options.promptTemplate);
        const request = this.buildRequest(messages);
        const { data, duration } = await this.makeRequest(request);
        const content = this.parseResponse(data);
        return this.createResult(text, content, options.sourceLang, options.targetLang, duration);
    }
}
exports.KimiProvider = KimiProvider;
//# sourceMappingURL=kimi.js.map
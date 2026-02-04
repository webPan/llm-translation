"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlmProvider = void 0;
const base_1 = require("./base");
class GlmProvider extends base_1.BaseProvider {
    constructor(config) {
        super({
            baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
            ...config,
        });
        this.id = 'glm';
        this.name = '智谱 GLM';
        if (!this.config.model) {
            this.config.model = 'glm-4';
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
            throw new Error('智谱 GLM API Key 未配置');
        }
        const messages = this.buildMessages(text, options.sourceLang, options.targetLang, options.promptTemplate);
        const request = this.buildRequest(messages);
        const { data, duration } = await this.makeRequest(request);
        const content = this.parseResponse(data);
        return this.createResult(text, content, options.sourceLang, options.targetLang, duration);
    }
}
exports.GlmProvider = GlmProvider;
//# sourceMappingURL=glm.js.map
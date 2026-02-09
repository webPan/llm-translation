import { BaseProvider } from './base';
import {
  ProviderId,
  ProviderConfig,
  TranslateOptions,
  TranslationResult,
  ChatMessage,
  ChatCompletionRequest,
} from '../types';

export class DeepSeekProvider extends BaseProvider {
  readonly id: ProviderId = 'deepseek';
  readonly name = 'DeepSeek';
  
  constructor(config: ProviderConfig) {
    super({
      baseUrl: 'https://api.deepseek.com',
      ...config,
    });
    // Set default model if not provided
    if (!this.config.model) {
      this.config.model = 'deepseek-chat';
    }
  }
  
  validateConfig(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }
  
  protected getAuthHeader(): string {
    return `Bearer ${this.config.apiKey}`;
  }
  
  protected buildRequest(messages: ChatMessage[]): ChatCompletionRequest {
    return {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };
  }
  
  protected parseResponse(response: any): string {
    return response.choices?.[0]?.message?.content || '';
  }
  
  async translate(text: string, options: TranslateOptions): Promise<TranslationResult> {
    if (!this.validateConfig()) {
      throw new Error('DeepSeek API Key 未配置');
    }
    
    const messages = this.buildMessages(
      text,
      options.sourceLang,
      options.targetLang,
      options.promptTemplate
    );
    const request = this.buildRequest(messages);
    
    const { data, duration } = await this.makeRequest(request);
    const content = this.parseResponse(data);
    
    return this.createResult(
      text,
      content,
      options.sourceLang,
      options.targetLang,
      duration
    );
  }
}

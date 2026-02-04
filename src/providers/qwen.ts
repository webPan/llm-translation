import { BaseProvider } from './base';
import {
  ProviderId,
  ProviderConfig,
  TranslateOptions,
  TranslationResult,
  ChatMessage,
  ChatCompletionRequest,
} from '../types';

export class QwenProvider extends BaseProvider {
  readonly id: ProviderId = 'qwen';
  readonly name = '千问';
  
  constructor(config: ProviderConfig) {
    super({
      baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
      ...config,
    });
    if (!this.config.model) {
      this.config.model = 'qwen-turbo';
    }
  }
  
  validateConfig(): boolean {
    return !!this.config.apiKey && this.config.apiKey.length > 0;
  }
  
  protected getAuthHeader(): string {
    return `Bearer ${this.config.apiKey}`;
  }
  
  protected buildRequest(messages: ChatMessage[]): ChatCompletionRequest {
    // Qwen uses a different message format
    return {
      model: this.config.model,
      messages,
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    };
  }
  
  protected parseResponse(response: any): string {
    // Qwen response format
    return response.output?.text || 
           response.output?.choices?.[0]?.message?.content || 
           response.choices?.[0]?.message?.content || 
           '';
  }
  
  async translate(text: string, options: TranslateOptions): Promise<TranslationResult> {
    if (!this.validateConfig()) {
      throw new Error('千问 (Qwen) API Key 未配置');
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
  
  protected async makeRequest(request: ChatCompletionRequest): Promise<any> {
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
    } catch (error) {
      this.handleError(error as any);
      throw error;
    }
  }
}

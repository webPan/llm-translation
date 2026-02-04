import * as vscode from 'vscode';
import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  LLMProvider,
  ProviderId,
  ProviderConfig,
  TranslateOptions,
  TranslationResult,
  Language,
  ChatMessage,
  ChatCompletionRequest,
} from '../types';
import { getPromptManager } from '../services/promptManager';
import { getResultParser } from '../services/parser';

export abstract class BaseProvider implements LLMProvider {
  abstract readonly id: ProviderId;
  abstract readonly name: string;
  
  protected config: ProviderConfig;
  protected client: AxiosInstance;
  
  constructor(config: ProviderConfig) {
    this.config = {
      temperature: 0.7,
      maxTokens: 2048,
      ...config,
    };
    
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: 60000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    // Add request interceptor for auth
    this.client.interceptors.request.use(
      (config) => {
        config.headers.Authorization = this.getAuthHeader();
        return config;
      },
      (error) => Promise.reject(error)
    );
  }
  
  abstract validateConfig(): boolean;
  abstract translate(text: string, options: TranslateOptions): Promise<TranslationResult>;
  
  protected abstract getAuthHeader(): string;
  protected abstract buildRequest(messages: ChatMessage[]): ChatCompletionRequest;
  protected abstract parseResponse(response: any): string;
  
  protected getDefaultSystemPrompt(targetLang: Language): string {
    const langMap: Record<string, string> = {
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
  
  protected buildMessages(
    text: string,
    sourceLang: Language,
    targetLang: Language,
    promptTemplate?: string
  ): ChatMessage[] {
    // Use prompt manager to build the prompt
    const promptManager = getPromptManager();
    const userContent = promptManager.buildPrompt(
      promptTemplate || 'default',
      text,
      sourceLang,
      targetLang
    );
    
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
  
  protected async makeRequest(request: ChatCompletionRequest): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await this.client.post('/chat/completions', request);
      return {
        data: response.data,
        duration: Date.now() - startTime,
      };
    } catch (error) {
      this.handleError(error as AxiosError);
      throw error;
    }
  }
  
  protected handleError(error: AxiosError): void {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;
      
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
    } else if (error.request) {
      throw new Error('网络请求失败，请检查网络连接');
    } else {
      throw new Error(`请求错误: ${error.message}`);
    }
  }
  
  protected parseJsonResponse(content: string): any {
    try {
      // Try to extract JSON from markdown code block
      const jsonMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1].trim());
      }
      
      // Try to parse the whole content as JSON
      return JSON.parse(content);
    } catch {
      // Return a simple object with the content as translation
      return {
        translation: content.trim(),
        alternatives: [],
      };
    }
  }
  
  protected createResult(
    original: string,
    content: string,
    sourceLang: Language,
    targetLang: Language,
    duration: number
  ): TranslationResult {
    // Use result parser to parse the response
    const parser = getResultParser();
    return parser.parse(
      content,
      original,
      sourceLang,
      targetLang,
      this.name,
      this.config.model || 'unknown',
      duration
    );
  }
}

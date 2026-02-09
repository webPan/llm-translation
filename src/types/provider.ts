import type { Language } from './language';

export type ProviderId = 'deepseek' | 'qwen' | 'kimi' | 'glm';

export interface ProviderConfig {
  id: ProviderId;
  name: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  apiEndpoint?: string;
  temperature?: number;
  maxTokens?: number;
  configured?: boolean;
}

export interface LLMProvider {
  readonly id: ProviderId;
  readonly name: string;
  translate(text: string, options: {
    text: string;
    sourceLang: Language;
    targetLang: Language;
    provider?: ProviderId;
    promptTemplate?: string;
  }): Promise<{
    original: string;
    translation: string;
    pronunciation?: string;
    alternatives?: string[];
    explanations?: {
      word: string;
      part?: string;
      definition?: string;
      pronunciation?: string;
      meaning: string;
      pos?: string;
    }[];
    examples?: {
      source: string;
      target: string;
      original?: string;
      translation?: string;
    }[];
    sourceLang: Language;
    targetLang: Language;
    provider: string;
    model: string;
    duration: number;
    raw?: any;
  }>;
  validateConfig(): boolean;
}

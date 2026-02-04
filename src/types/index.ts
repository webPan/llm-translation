// Language definitions
export type Language = 'zh' | 'en' | 'ja' | 'auto';

export interface LanguageOption {
  code: Language;
  name: string;
  localName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'zh', name: 'Chinese', localName: '中文' },
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
];

// Provider definitions
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

// Translation options
export interface TranslateOptions {
  text: string;
  sourceLang: Language;
  targetLang: Language;
  provider?: ProviderId;
  promptTemplate?: string;
}

// Translation result
export interface TranslationResult {
  original: string;
  translation: string;
  pronunciation?: string;
  alternatives?: string[];
  explanations?: WordExplanation[];
  examples?: Example[];
  sourceLang: Language;
  targetLang: Language;
  provider: string;
  model: string;
  duration: number;
  raw?: any;
}

export interface WordExplanation {
  word: string;
  part?: string; // Part of speech
  definition?: string;
  pronunciation?: string;
  meaning: string;
  pos?: string; // Part of speech
}

export interface Example {
  source: string;
  target: string;
  original?: string;
  translation?: string;
}

// Display mode
export type DisplayMode = 'simple' | 'normal';

export interface SimpleModeConfig {
  autoHide: boolean;
  autoHideDelay: number;
  showPronunciation: boolean;
  showLanguageDirection: boolean;
  showProvider: boolean;
  showDuration: boolean;
  showExpandButton: boolean;
  showAlternatives: boolean;
  maxAlternatives: number;
  position: 'above' | 'below' | 'auto';
  panelMode: 'inline' | 'hover' | 'window';
}

export interface DisplayModeConfig {
  mode: DisplayMode;
  simple: SimpleModeConfig;
}

// Prompt template
export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  description?: string;
}

// Extension configuration
export interface ExtensionConfig {
  defaultProvider: ProviderId;
  defaultTargetLang: Language;
  displayMode: DisplayMode;
  providers: {
    deepseek: ProviderConfig;
    qwen: ProviderConfig;
    kimi: ProviderConfig;
    glm: ProviderConfig;
  };
  simpleMode: SimpleModeConfig;
  defaultPromptTemplate: string;
  customPromptTemplates: PromptTemplate[];
}

// LLM Provider interface
export interface LLMProvider {
  readonly id: ProviderId;
  readonly name: string;
  translate(text: string, options: TranslateOptions): Promise<TranslationResult>;
  validateConfig(): boolean;
}

// API Request/Response types
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export interface ChatCompletionResponse {
  id: string;
  choices: {
    message: ChatMessage;
    finish_reason: string;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}


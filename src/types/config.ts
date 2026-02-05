import type { ProviderId, ProviderConfig } from './provider';
import type { Language } from './language';

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

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
  description?: string;
}

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

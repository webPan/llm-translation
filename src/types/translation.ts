import type { Language } from './language';
import type { ProviderId } from './provider';

export interface TranslateOptions {
  text: string;
  sourceLang: Language;
  targetLang: Language;
  provider?: ProviderId;
  promptTemplate?: string;
}

export interface WordExplanation {
  word: string;
  part?: string;
  definition?: string;
  pronunciation?: string;
  meaning: string;
  pos?: string;
}

export interface Example {
  source: string;
  target: string;
  original?: string;
  translation?: string;
}

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

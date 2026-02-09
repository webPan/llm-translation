// Language definitions
export type Language = 'zh' | 'en' | 'ja' | 'auto';

export interface LanguageOption {
  code: Language;
  name: string;
  localName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'auto', name: 'Auto', localName: '自动检测' },
  { code: 'zh', name: 'Chinese', localName: '中文' },
  { code: 'en', name: 'English', localName: 'English' },
  { code: 'ja', name: 'Japanese', localName: '日本語' },
];

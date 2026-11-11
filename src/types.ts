export interface CodeItem {
  id: string;
  original_code: string;
}

export type ThemeMode = 'dark' | 'light';
export type Language = 'en' | 'fr' | 'ar';

export interface AppSettings {
  theme: ThemeMode;
  language: Language;
  signature?: string;
}

export type ActiveTab = 'import' | 'viewer' | 'settings';

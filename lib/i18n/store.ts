import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import tr from '@/locales/tr.json';
import en from '@/locales/en.json';
import pt from '@/locales/pt.json';

const dictionaries = { tr, en, pt };
export type Language = 'tr' | 'en' | 'pt';

type I18nStore = {
  lang: Language;
  setLang: (lang: Language) => void;
};

export const useI18nStore = create<I18nStore>()(
  persist(
    (set) => ({
      lang: 'tr',
      setLang: (lang) => set({ lang }),
    }),
    { name: 'xivizley-lang' }
  )
);

// Utility to get deep nested values from an object, e.g., t('architect.inspector.configure')
export function useTranslation() {
  const lang = useI18nStore((s) => s.lang);
  const dict = dictionaries[lang];

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: unknown = dict;
    for (const k of keys) {
      if (!value || typeof value !== 'object' || (value as Record<string, unknown>)[k] === undefined) {
        console.warn(`Translation missing for key: ${key} in ${lang}`);
        return key;
      }
      value = (value as Record<string, unknown>)[k];
    }
    return typeof value === 'string' ? value : key;
  };

  return { t, lang };
}

/**
 * contexts/LanguageContext.tsx
 * Multi-Language Provider for AgriOptima AI Mobile
 * Supports 22 Scheduled Indian Languages + English, with full localization for English & Hindi,
 * and graceful Coming Soon behavior for remaining 20 languages.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getItem, setItem, STORAGE_KEYS } from '@/lib/storage';
import {
  ALL_SUPPORTED_LANGUAGES,
  ENGLISH_LANGUAGE,
  LanguageOption,
  getLanguageByCode,
  isLanguageAvailable,
} from '@/i18n/languages';
import { en } from '@/i18n/translations/en';
import { hi } from '@/i18n/translations/hi';

type TranslationTree = typeof en;

interface LanguageContextType {
  language: string; // 'en' | 'hi'
  languageOption: LanguageOption;
  setLanguage: (code: string) => boolean;
  t: (path: string, params?: Record<string, string | number>) => string;
  allLanguages: LanguageOption[];
  isComingSoonModalOpen: boolean;
  pendingLanguage: LanguageOption | null;
  closeComingSoonModal: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const TRANSLATIONS: Record<string, TranslationTree> = {
  en,
  hi,
};

function getNestedValue(obj: any, path: string): string | undefined {
  const parts = path.split('.');
  let current = obj;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return typeof current === 'string' ? current : undefined;
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<string>('en');
  const [isComingSoonModalOpen, setIsComingSoonModalOpen] = useState<boolean>(false);
  const [pendingLanguage, setPendingLanguage] = useState<LanguageOption | null>(null);

  // Load saved language preference on mount
  useEffect(() => {
    getItem<string>(STORAGE_KEYS.SAVED_LANGUAGE, 'en').then((saved) => {
      if (saved && (saved === 'en' || saved === 'hi')) {
        setLanguageState(saved);
      }
    });
  }, []);

  const setLanguage = useCallback((code: string): boolean => {
    const opt = getLanguageByCode(code);
    if (!isLanguageAvailable(code)) {
      // Show Coming Soon modal without breaking UI state
      setPendingLanguage(opt);
      setIsComingSoonModalOpen(true);
      return false;
    }

    setLanguageState(opt.code);
    setItem(STORAGE_KEYS.SAVED_LANGUAGE, opt.code);
    return true;
  }, []);

  const closeComingSoonModal = useCallback(() => {
    setIsComingSoonModalOpen(false);
    setPendingLanguage(null);
  }, []);

  const t = useCallback(
    (path: string, params?: Record<string, string | number>): string => {
      const currentDict = TRANSLATIONS[language] || en;
      let text = getNestedValue(currentDict, path) || getNestedValue(en, path) || path;

      if (params) {
        Object.entries(params).forEach(([key, val]) => {
          text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(val));
        });
      }

      return text;
    },
    [language]
  );

  const languageOption = useMemo(() => getLanguageByCode(language), [language]);

  const value = useMemo(
    () => ({
      language,
      languageOption,
      setLanguage,
      t,
      allLanguages: ALL_SUPPORTED_LANGUAGES,
      isComingSoonModalOpen,
      pendingLanguage,
      closeComingSoonModal,
    }),
    [language, languageOption, setLanguage, t, isComingSoonModalOpen, pendingLanguage, closeComingSoonModal]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

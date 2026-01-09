'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation as useI18nTranslation } from '@/lib/i18n';

/**
 * Hook to use translations with current language from context
 */
export function useTranslation() {
  const { language } = useTheme();
  const t = useI18nTranslation(language);
  
  return t;
}


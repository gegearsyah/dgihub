'use client';

import { useTheme } from '@/contexts/ThemeContext';

type Language = 'id' | 'en';

interface LanguageToggleProps {
  defaultLanguage?: Language;
  onLanguageChange?: (lang: Language) => void;
  className?: string;
}

/**
 * Language Toggle Component
 * Dual-toggle (ID/EN) for Indonesian and English
 * Visible in top header
 */
export default function LanguageToggle({
  defaultLanguage,
  onLanguageChange,
  className = ''
}: LanguageToggleProps) {
  const { language, setLanguage, theme } = useTheme();
  const isDark = theme === 'dark';

  const handleToggle = (lang: Language) => {
    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => handleToggle('id')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-target ${
          language === 'id'
            ? 'bg-[#2D6A4F] text-white'
            : isDark
            ? 'bg-[#1B263B] text-[#C5C6C0] hover:bg-[#415A77]'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        aria-label="Switch to Indonesian"
      >
        ID
      </button>
      <button
        onClick={() => handleToggle('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-target ${
          language === 'en'
            ? 'bg-[#2D6A4F] text-white'
            : isDark
            ? 'bg-[#1B263B] text-[#C5C6C0] hover:bg-[#415A77]'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}


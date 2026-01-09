'use client';

import { useState, useEffect } from 'react';
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
  const { language, setLanguage } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleToggle = (lang: Language) => {
    setLanguage(lang);
    onLanguageChange?.(lang);
  };

  if (!mounted) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted animate-pulse">ID</div>
        <div className="px-3 py-1.5 rounded-lg text-sm font-medium bg-muted animate-pulse">EN</div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={() => handleToggle('id')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-target ${
          language === 'id'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
        aria-label="Switch to Indonesian"
      >
        ID
      </button>
      <button
        onClick={() => handleToggle('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors touch-target ${
          language === 'en'
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-muted/80'
        }`}
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}


'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from 'next-themes';

type Theme = 'dark' | 'light';
type Language = 'id' | 'en';

interface ThemeContextType {
  theme: Theme;
  language: Language;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved language preference
    if (typeof window !== 'undefined') {
      const savedLang = localStorage.getItem('language') as Language;
      if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
        setLanguageState(savedLang);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && typeof window !== 'undefined') {
      localStorage.setItem('language', language);
      // Set HTML lang attribute for accessibility
      document.documentElement.setAttribute('lang', language);
    }
  }, [language, mounted]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Use next-themes for theme management (handles hydration properly)
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <ThemeContextInner language={language} setLanguage={setLanguage}>
        {children}
      </ThemeContextInner>
    </NextThemesProvider>
  );
}

function ThemeContextInner({ 
  children, 
  language, 
  setLanguage 
}: { 
  children: ReactNode;
  language: Language;
  setLanguage: (lang: Language) => void;
}) {
  const { theme, setTheme } = useNextTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <ThemeContext.Provider value={{ theme: (theme || 'dark') as Theme, language, toggleTheme, setLanguage }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}


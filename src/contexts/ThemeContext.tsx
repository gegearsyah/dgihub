'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  const [theme, setTheme] = useState<Theme>('dark');
  const [language, setLanguageState] = useState<Language>('id');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved preferences
    const savedTheme = localStorage.getItem('theme') as Theme;
    const savedLang = localStorage.getItem('language') as Language;
    
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme);
    }
    if (savedLang && (savedLang === 'id' || savedLang === 'en')) {
      setLanguageState(savedLang);
    }
  }, []);

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('language', language);
      // Set HTML lang attribute for accessibility
      document.documentElement.setAttribute('lang', language);
    }
  }, [language, mounted]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Always provide the context, even before mounted, to prevent errors
  return (
    <ThemeContext.Provider value={{ theme, language, toggleTheme, setLanguage }}>
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


'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`touch-target flex items-center justify-center ${className}`}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
      )}
    </button>
  );
}


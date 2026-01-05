'use client';

import { useTheme } from '@/contexts/ThemeContext';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';

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
        <LightModeIcon className="text-[#E0E1DD] hover:text-[#2D6A4F] transition-colors" />
      ) : (
        <DarkModeIcon className="text-[#0D1B2A] hover:text-[#2D6A4F] transition-colors" />
      )}
    </button>
  );
}


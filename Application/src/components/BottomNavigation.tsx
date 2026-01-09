'use client';

import React from 'react';
import { Home, GraduationCap, Wallet, User } from 'lucide-react';

export default function CustomBottomNavigation() {
  const [value, setValue] = React.useState(0);

  const navItems = [
    { label: 'Home', icon: Home, path: '/dashboard' },
    { label: 'Courses', icon: GraduationCap, path: '/talenta/courses' },
    { label: 'Wallet', icon: Wallet, path: '/talenta/certificates' },
    { label: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border shadow-lg">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={item.path}
              onClick={() => {
                setValue(index);
                // Navigation would be handled by router
              }}
              className={`flex flex-col items-center justify-center gap-1 flex-1 transition-colors ${
                value === index ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
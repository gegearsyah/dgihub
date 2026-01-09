'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconButton, Badge } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { mockNotifications } from '@/lib/mockData';
import { useTheme } from '@/contexts/ThemeContext';

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const isDark = theme === 'dark';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = (id: string) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <IconButton
        size="large"
        onClick={() => setIsOpen(!isOpen)}
        className={isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsNoneIcon fontSize="inherit" />
        </Badge>
      </IconButton>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-80 z-50 rounded-lg shadow-xl overflow-hidden ${
              isDark
                ? 'bg-[#1B263B] border border-[#415A77]'
                : 'bg-white border border-gray-200'
            }`}
          >
            <div className={`p-4 border-b flex items-center justify-between ${
              isDark ? 'border-[#415A77]' : 'border-gray-200'
            }`}>
              <h3 className={`font-semibold ${
                isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
              }`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className={`text-sm transition-colors touch-target ${
                    isDark
                      ? 'text-[#2D6A4F] hover:text-[#2D6A4F]/80'
                      : 'text-[#2D6A4F] hover:text-[#2D6A4F]/80'
                  }`}
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className={`p-8 text-center ${
                  isDark ? 'text-[#C5C6C0]' : 'text-gray-500'
                }`}>
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b cursor-pointer transition-colors ${
                      isDark
                        ? `border-[#415A77] hover:bg-[#0D1B2A] ${
                            !notification.read ? 'bg-[#0D1B2A]/50' : ''
                          }`
                        : `border-gray-100 hover:bg-gray-50 ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-lg">
                        {notification.type === 'course_enrolled' && '📚'}
                        {notification.type === 'certificate_issued' && '🏆'}
                        {notification.type === 'job_application' && '💼'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${
                          isDark ? 'text-[#E0E1DD]' : 'text-[#0D1B2A]'
                        }`}>
                          {notification.title}
                        </p>
                        <p className={`text-sm mt-1 ${
                          isDark ? 'text-[#C5C6C0]' : 'text-gray-600'
                        }`}>
                          {notification.message}
                        </p>
                        <p className={`text-xs mt-1 ${
                          isDark ? 'text-[#6b7280]' : 'text-gray-400'
                        }`}>
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-[#2D6A4F] rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className={`p-4 border-t text-center ${
              isDark ? 'border-[#415A77]' : 'border-gray-200'
            }`}>
              <button className={`text-sm transition-colors touch-target ${
                isDark
                  ? 'text-[#2D6A4F] hover:text-[#2D6A4F]/80'
                  : 'text-[#2D6A4F] hover:text-[#2D6A4F]/80'
              }`}>
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




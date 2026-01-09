'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { mockNotifications } from '@/lib/mockData';

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;

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
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs font-bold text-destructive-foreground">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 z-50 rounded-lg shadow-xl overflow-hidden bg-card border border-border"
          >
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">
                Notifications
              </h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm transition-colors touch-target text-primary hover:text-primary/80"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`p-4 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${
                      !notification.read ? 'bg-muted/30' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 text-lg">
                        {notification.type === 'course_enrolled' && '📚'}
                        {notification.type === 'certificate_issued' && '🏆'}
                        {notification.type === 'job_application' && '💼'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {notification.message}
                        </p>
                        <p className="text-xs mt-1 text-muted-foreground/70">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.read && (
                        <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-4 border-t border-border text-center">
              <button className="text-sm transition-colors touch-target text-primary hover:text-primary/80">
                View All Notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}




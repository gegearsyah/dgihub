'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onClose: (id: string) => void;
}

export default function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        onClose(toast.id);
      }, toast.duration || 5000);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onClose]);

  const icons = {
    success: <CheckCircleIcon className="text-[#2D6A4F]" />,
    error: <ErrorIcon className="text-[#BA1A1A]" />,
    warning: <WarningIcon className="text-[#fbbf24]" />,
    info: <InfoIcon className="text-[#3b82f6]" />,
  };

  const bgColors = {
    success: 'bg-[#2D6A4F]/20 border-[#2D6A4F]',
    error: 'bg-[#BA1A1A]/20 border-[#BA1A1A]',
    warning: 'bg-[#fbbf24]/20 border-[#fbbf24]',
    info: 'bg-[#3b82f6]/20 border-[#3b82f6]',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      className={`${bgColors[toast.type]} border rounded-lg p-4 shadow-lg backdrop-blur-sm min-w-[300px] max-w-md`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[#E0E1DD] break-words">
            {toast.message}
          </p>
        </div>
        <button
          onClick={() => onClose(toast.id)}
          className="flex-shrink-0 text-[#C5C6C0] hover:text-[#E0E1DD] transition-colors touch-target"
          aria-label="Close"
        >
          <CloseIcon fontSize="small" />
        </button>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onClose={onClose} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}


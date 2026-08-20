'use client';

import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { AlertTriangle, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
  confirmDialog?: ConfirmDialogState | null;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
  confirmDialog,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <>
      {/* Warning / Confirmation Dialog Overlay */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className={`border rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4 transition-colors ${
            isDark ? 'bg-[#1f2c1d] border-[#3c5638] text-[#fefae0]' : 'bg-white border-[#d4ddcf] text-[#1b2819]'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl border shrink-0 ${
                isDark ? 'bg-[#3c5638] text-[#fefae0] border-[#556b2f]' : 'bg-[#e9edc9] text-[#1b2819] border-[#d4ddcf]'
              }`}>
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-extrabold">
                  {confirmDialog.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]'}`}>
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${
              isDark ? 'border-[#3c5638]' : 'border-[#e2e8f0]'
            }`}>
              <button
                onClick={confirmDialog.onCancel}
                className={`px-4 py-2 text-xs font-semibold rounded-xl border transition ${
                  isDark ? 'bg-[#141d13] text-[#e9edc9] border-[#3c5638] hover:bg-[#3c5638]' : 'bg-[#faf8f3] text-[#1b2819] border-[#d4ddcf] hover:bg-[#e9edc9]'
                }`}
              >
                {confirmDialog.cancelText || 'Cancel'}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md transition"
              >
                {confirmDialog.confirmText || 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification Banners Container */}
      <div className="fixed top-5 right-5 z-50 space-y-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} isDark={isDark} />
        ))}
      </div>
    </>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void; isDark: boolean }> = ({
  toast,
  onDismiss,
  isDark,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const styleMap = {
    success: {
      bg: isDark ? 'bg-[#1f2c1d]/95 border-[#556b2f] text-[#fefae0]' : 'bg-white/95 border-[#385233] text-[#1b2819]',
      iconBg: isDark ? 'bg-[#386641] text-[#fefae0]' : 'bg-[#e9edc9] text-[#1b2819]',
      icon: CheckCircle2,
      title: toast.title || 'Success',
      titleColor: isDark ? 'text-[#a3b18a]' : 'text-[#385233]',
    },
    warning: {
      bg: isDark ? 'bg-[#1f2c1d]/95 border-amber-500 text-[#fefae0]' : 'bg-white/95 border-amber-500 text-[#1b2819]',
      iconBg: 'bg-amber-500/20 text-amber-500',
      icon: AlertTriangle,
      title: toast.title || 'Warning',
      titleColor: 'text-amber-500',
    },
    error: {
      bg: isDark ? 'bg-[#1f2c1d]/95 border-rose-500 text-[#fefae0]' : 'bg-white/95 border-rose-500 text-[#1b2819]',
      iconBg: 'bg-rose-500/20 text-rose-500',
      icon: AlertCircle,
      title: toast.title || 'Error',
      titleColor: 'text-rose-500',
    },
    info: {
      bg: isDark ? 'bg-[#1f2c1d]/95 border-[#3c5638] text-[#fefae0]' : 'bg-white/95 border-[#d4ddcf] text-[#1b2819]',
      iconBg: isDark ? 'bg-[#3c5638] text-[#fefae0]' : 'bg-[#e9edc9] text-[#1b2819]',
      icon: Info,
      title: toast.title || 'Notification',
      titleColor: isDark ? 'text-[#e9edc9]' : 'text-[#556b2f]',
    },
  };

  const style = styleMap[toast.type];
  const IconComponent = style.icon;

  return (
    <div
      className={`p-4 border rounded-2xl shadow-xl backdrop-blur-md flex items-start justify-between gap-3 pointer-events-auto transition-all transform animate-in slide-in-from-right-5 ${style.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl shrink-0 ${style.iconBg}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className={`text-xs font-extrabold ${style.titleColor}`}>{style.title}</h4>
          <p className="text-xs leading-snug">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="p-1 rounded-lg hover:opacity-75 transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

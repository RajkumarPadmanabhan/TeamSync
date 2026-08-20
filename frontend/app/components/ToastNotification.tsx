'use client';

import React, { useEffect } from 'react';
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
  return (
    <>
      {/* Warning / Confirmation Dialog Overlay */}
      {confirmDialog && confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden p-6 space-y-4 text-slate-200">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 flex-1">
                <h3 className="text-base font-extrabold text-white">
                  {confirmDialog.title}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={confirmDialog.onCancel}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl border border-slate-700 transition"
              >
                {confirmDialog.cancelText || 'Cancel'}
              </button>
              <button
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-lg shadow-rose-600/20 transition"
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
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </div>
    </>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss,
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4500);

    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const styleMap = {
    success: {
      bg: 'bg-slate-900/95 border-emerald-500/40',
      iconBg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: CheckCircle2,
      title: toast.title || 'Success',
      titleColor: 'text-emerald-300',
    },
    warning: {
      bg: 'bg-slate-900/95 border-amber-500/40',
      iconBg: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: AlertTriangle,
      title: toast.title || 'Warning',
      titleColor: 'text-amber-300',
    },
    error: {
      bg: 'bg-slate-900/95 border-rose-500/40',
      iconBg: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
      icon: AlertCircle,
      title: toast.title || 'Error',
      titleColor: 'text-rose-300',
    },
    info: {
      bg: 'bg-slate-900/95 border-indigo-500/40',
      iconBg: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
      icon: Info,
      title: toast.title || 'Notification',
      titleColor: 'text-indigo-300',
    },
  };

  const style = styleMap[toast.type];
  const IconComponent = style.icon;

  return (
    <div
      className={`p-4 border rounded-2xl shadow-2xl backdrop-blur-md flex items-start justify-between gap-3 text-slate-200 pointer-events-auto transition-all transform animate-in slide-in-from-right-5 ${style.bg}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-xl border shrink-0 ${style.iconBg}`}>
          <IconComponent className="w-4 h-4" />
        </div>
        <div className="space-y-0.5">
          <h4 className={`text-xs font-extrabold ${style.titleColor}`}>{style.title}</h4>
          <p className="text-xs text-slate-300 leading-snug">{toast.message}</p>
        </div>
      </div>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

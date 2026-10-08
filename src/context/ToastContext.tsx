import React, { createContext, useContext, useState, useCallback, useId } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastContextType {
  toasts: ToastItem[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastItem = { id, message, type, duration };

    setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 visible

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string, d?: number) => showToast(msg, 'success', d), [showToast]);
  const error = useCallback((msg: string, d?: number) => showToast(msg, 'error', d), [showToast]);
  const warning = useCallback((msg: string, d?: number) => showToast(msg, 'warning', d), [showToast]);
  const info = useCallback((msg: string, d?: number) => showToast(msg, 'info', d), [showToast]);

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--color-verified)" />;
      case 'error':
        return <AlertCircle size={18} color="var(--color-fake)" />;
      case 'warning':
        return <AlertTriangle size={18} color="var(--color-warning)" />;
      case 'info':
      default:
        return <Info size={18} color="var(--color-primary)" />;
    }
  };

  const getToastBorder = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'var(--color-verified-border)';
      case 'error':
        return 'var(--color-fake-border)';
      case 'warning':
        return 'rgba(245, 158, 11, 0.4)';
      case 'info':
      default:
        return 'var(--border-subtle)';
    }
  };

  const getToastBg = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '#f0fdf4';
      case 'error':
        return '#fef2f2';
      case 'warning':
        return '#fffbeb';
      case 'info':
      default:
        return '#ffffff';
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast, success, error, warning, info }}>
      {children}

      {/* Floating Toast Portal Container */}
      <div
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: 'fixed',
          bottom: 'var(--space-6)',
          right: 'var(--space-6)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-3)',
          maxWidth: '380px',
          width: 'calc(100vw - 32px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-3)',
              padding: '12px 16px',
              backgroundColor: getToastBg(toast.type),
              border: `1px solid ${getToastBorder(toast.type)}`,
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-xl)',
              color: 'var(--text-primary)',
              fontSize: 'var(--text-sm)',
              animation: 'fadeIn var(--transition-fast) ease-out'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div style={{ flexShrink: 0 }}>{getToastIcon(toast.type)}</div>
              <span style={{ lineHeight: 1.4, fontWeight: 500, wordBreak: 'break-word' }}>
                {toast.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--radius-sm)',
                flexShrink: 0
              }}
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

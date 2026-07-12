import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { cx } from '@/lib';

type ToastTone = 'success' | 'error' | 'info' | 'warning';

type ToastProps = {
  tone?: ToastTone;
  role?: 'status' | 'alert';
  // Optional interactive slot (link/button) rendered at the end of the toast.
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

const BASE_CLASS =
  'flex w-full items-center justify-between gap-4 rounded-lg border px-4 py-3 text-sm font-medium shadow-md';

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'border-brand-300 bg-brand-50 text-brand-800',
  error: 'border-red-300 bg-red-50 text-red-700',
  info: 'border-ink-200 bg-white text-ink-800',
  warning: 'border-amber-300 bg-amber-50 text-amber-800',
};

// The one toast look: tone picks the design, children/action supply the content.
// Positioning stays with the caller (ToastProvider stacks them, HoldToast floats one).
export const Toast = ({
  tone = 'info',
  role = 'status',
  action,
  className = '',
  children,
}: ToastProps) => (
  <div role={role} className={cx(BASE_CLASS, TONE_STYLES[tone], className)}>
    <p>{children}</p>
    {action}
  </div>
);

type ToastEntry = { id: number; message: string; tone: ToastTone };

type ToastContextValue = {
  notify: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const AUTO_DISMISS_MS = 4000;

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const notify = useCallback((message: string, tone: ToastTone = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), AUTO_DISMISS_MS);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((toast) => (
          <Toast key={toast.id} tone={toast.tone} role="alert" className="max-w-sm">
            {toast.message}
          </Toast>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
};

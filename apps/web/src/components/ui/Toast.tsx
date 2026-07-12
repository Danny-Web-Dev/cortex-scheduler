import { cx } from '@/utils';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

type ToastProps = {
  tone?: ToastTone;
  role?: 'status' | 'alert';
  // Optional interactive slot (link/button) rendered at the end of the toast.
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
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

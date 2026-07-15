import { cx } from '@/utils';

export type ToastTone = 'success' | 'error' | 'info' | 'warning';

type ToastProps = {
  tone?: ToastTone;
  role?: 'status' | 'alert';
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

const BASE_CLASS = 'toast';

const TONE_STYLES: Record<ToastTone, string> = {
  success: 'toast-success',
  error: 'toast-error',
  info: 'toast-info',
  warning: 'toast-warning',
};

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

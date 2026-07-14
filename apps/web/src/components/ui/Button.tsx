import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  children: ReactNode;
};

const BASE_CLASS = 'btn';

const VARIANTS: Record<Variant, string> = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export const Button = ({
  variant = 'primary',
  loading = false,
  disabled,
  children,
  className = '',
  ...rest
}: ButtonProps) => (
  <button
    disabled={disabled || loading}
    className={cx(BASE_CLASS, VARIANTS[variant], className)}
    {...rest}
  >
    {loading && <Spinner size="sm" />}
    {children}
  </button>
);

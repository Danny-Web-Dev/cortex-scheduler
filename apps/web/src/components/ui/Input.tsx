import type { InputHTMLAttributes } from 'react';
import { cx } from '@/utils';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

const BASE_CLASS = 'field-input';

export const Input = ({ label, error, id, className = '', ...rest }: InputProps) => (
  <label htmlFor={id} className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>}
    <input
      id={id}
      className={cx(BASE_CLASS, error ? 'border-red-400' : '', className)}
      {...rest}
    />
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
);

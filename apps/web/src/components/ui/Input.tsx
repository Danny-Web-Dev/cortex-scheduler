import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = ({ label, error, id, className = '', ...rest }: InputProps) => (
  <label htmlFor={id} className="block">
    {label && <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>}
    <input
      id={id}
      className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-500 ${
        error ? 'border-red-400' : 'border-ink-200'
      } ${className}`}
      {...rest}
    />
    {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
  </label>
);

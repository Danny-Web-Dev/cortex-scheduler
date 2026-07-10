import type { HTMLAttributes, ReactNode } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

export const Card = ({ children, interactive = false, className = '', ...rest }: CardProps) => (
  <div
    className={`rounded-[var(--radius-card)] border border-ink-200 bg-white p-5 shadow-sm ${
      interactive ? 'cursor-pointer transition hover:border-brand-300 hover:shadow-md' : ''
    } ${className}`}
    {...rest}
  >
    {children}
  </div>
);

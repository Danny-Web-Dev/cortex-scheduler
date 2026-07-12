import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

const BASE_CLASS = 'rounded-card border border-ink-200 bg-white p-5 shadow-sm';
const INTERACTIVE_CLASS = 'cursor-pointer transition hover:border-brand-300 hover:shadow-md';

export const Card = ({ children, interactive = false, className = '', ...rest }: CardProps) => (
  <div className={cx(BASE_CLASS, interactive && INTERACTIVE_CLASS, className)} {...rest}>
    {children}
  </div>
);

import type { HTMLAttributes, ReactNode } from 'react';
import { cx } from '@/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  interactive?: boolean;
};

const BASE_CLASS = 'surface-card';
const INTERACTIVE_CLASS = 'surface-card-interactive';

export const Card = ({ children, interactive = false, className = '', ...rest }: CardProps) => (
  <div className={cx(BASE_CLASS, interactive && INTERACTIVE_CLASS, className)} {...rest}>
    {children}
  </div>
);

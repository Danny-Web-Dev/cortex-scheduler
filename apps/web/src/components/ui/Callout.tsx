import type { ReactNode } from 'react';
import { cx } from '@/utils';

type CalloutTone = 'brand' | 'amber';

type CalloutProps = {
  tone?: CalloutTone;
  className?: string;
  children: ReactNode;
};

const BASE_CLASS = 'rounded-lg border px-4 py-3 text-center text-sm';

const TONE_CLASS: Record<CalloutTone, string> = {
  brand: 'border-brand-200 bg-brand-50 text-brand-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
};

export const Callout = ({ tone = 'brand', className = '', children }: CalloutProps) => (
  <div className={cx(BASE_CLASS, TONE_CLASS[tone], className)}>{children}</div>
);

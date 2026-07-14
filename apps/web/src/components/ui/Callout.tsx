import type { ReactNode } from 'react';
import { cx } from '@/utils';

type CalloutTone = 'brand' | 'amber';

type CalloutProps = {
  tone?: CalloutTone;
  className?: string;
  children: ReactNode;
};

const BASE_CLASS = 'callout';

const TONE_CLASS: Record<CalloutTone, string> = {
  brand: 'callout-brand',
  amber: 'callout-amber',
};

export const Callout = ({ tone = 'brand', className = '', children }: CalloutProps) => (
  <div className={cx(BASE_CLASS, TONE_CLASS[tone], className)}>{children}</div>
);

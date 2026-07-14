import type { ReactNode } from 'react';
import { cx } from '@/utils';

type BadgeTone = 'amber' | 'brand' | 'accent' | 'neutral' | 'neutral-strong';

export type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

const BASE_CLASS = 'badge';

const TONE_CLASS: Record<BadgeTone, string> = {
  amber: 'badge-amber',
  brand: 'badge-brand',
  accent: 'badge-accent',
  neutral: 'badge-neutral',
  'neutral-strong': 'badge-neutral-strong',
};

export const Badge = ({ tone = 'neutral', children, className = '' }: BadgeProps) => (
  <span className={cx(BASE_CLASS, TONE_CLASS[tone], className)}>{children}</span>
);

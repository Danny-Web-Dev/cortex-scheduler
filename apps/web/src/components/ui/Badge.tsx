import type { ReactNode } from 'react';

export type BadgeTone = 'amber' | 'brand' | 'neutral' | 'neutral-strong';

export type BadgeProps = {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
};

const TONE_CLASS: Record<BadgeTone, string> = {
  amber: 'bg-amber-100 text-amber-700',
  brand: 'bg-brand-100 text-brand-700',
  neutral: 'bg-ink-100 text-ink-500',
  'neutral-strong': 'bg-ink-100 text-ink-600',
};

export const Badge = ({ tone = 'neutral', children, className = '' }: BadgeProps) => (
  <span
    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${TONE_CLASS[tone]} ${className}`}
  >
    {children}
  </span>
);

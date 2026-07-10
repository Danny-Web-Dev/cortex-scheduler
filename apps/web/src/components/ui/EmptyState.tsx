import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-dashed border-ink-200 bg-white px-6 py-10 text-center">
    <p className="text-base font-semibold text-ink-800">{title}</p>
    {description && <p className="max-w-sm text-sm text-ink-500">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

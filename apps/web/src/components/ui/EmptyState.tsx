import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="surface-empty">
    <p className="text-base font-semibold text-ink-800">{title}</p>
    {description && <p className="max-w-sm text-subtitle">{description}</p>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);

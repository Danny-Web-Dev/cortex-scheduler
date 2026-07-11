import type { ReactNode } from 'react';

type SectionHeadingProps = {
  children: ReactNode;
};

export const SectionHeading = ({ children }: SectionHeadingProps) => (
  <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-ink-500">{children}</h2>
);

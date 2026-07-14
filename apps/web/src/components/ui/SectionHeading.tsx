import type { ReactNode } from 'react';

type SectionHeadingProps = {
  children: ReactNode;
};

export const SectionHeading = ({ children }: SectionHeadingProps) => (
  <h2 className="eyebrow mb-3">{children}</h2>
);

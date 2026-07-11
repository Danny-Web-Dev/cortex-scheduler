type PageHeadingProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export const PageHeading = ({ title, subtitle, className = '' }: PageHeadingProps) => (
  <div className={className}>
    <h1 className="mb-1 text-2xl font-bold text-ink-900">{title}</h1>
    {subtitle && <p className="mb-6 text-sm text-ink-500">{subtitle}</p>}
  </div>
);

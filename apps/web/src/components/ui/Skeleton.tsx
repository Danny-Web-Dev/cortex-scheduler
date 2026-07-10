type SkeletonProps = {
  className?: string;
};

export const Skeleton = ({ className = '' }: SkeletonProps) => (
  <div className={`animate-pulse rounded-md bg-ink-100 ${className}`} />
);

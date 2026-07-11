import { Skeleton } from './Skeleton';

type SkeletonGridProps = {
  count: number;
  itemClassName: string;
  className: string;
};

export const SkeletonGrid = ({ count, itemClassName, className }: SkeletonGridProps) => (
  <div className={className}>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className={itemClassName} />
    ))}
  </div>
);

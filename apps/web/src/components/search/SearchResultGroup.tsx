import type { ReactNode } from 'react';

type SearchResultGroupProps<T> = {
  label: string;
  items: T[];
  keyOf: (item: T) => string;
  onPick: (item: T) => void;
  renderItem: (item: T) => ReactNode;
  className?: string;
};

export const SearchResultGroup = <T,>({
  label,
  items,
  keyOf,
  onPick,
  renderItem,
  className = '',
}: SearchResultGroupProps<T>) => (
  <div className={className}>
    <p className="px-4 pb-1 pt-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
      {label}
    </p>
    {items.map((item) => (
      <button
        key={keyOf(item)}
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => onPick(item)}
        className="block w-full px-4 py-2 text-left text-sm hover:bg-brand-50"
      >
        {renderItem(item)}
      </button>
    ))}
  </div>
);

import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { ErrorState } from './ErrorState';

type QueryStateProps<T> = {
  query: Pick<UseQueryResult<T>, 'data' | 'isPending' | 'isError' | 'refetch' | 'error'>;
  skeleton: ReactNode;
  errorMessage?: string;
  isEmpty?: (data: T) => boolean;
  empty?: ReactNode;
  children: (data: T) => ReactNode;
};

export const QueryState = <T,>({
  query,
  skeleton,
  errorMessage,
  isEmpty,
  empty,
  children,
}: QueryStateProps<T>) => {
  if (query.isPending) return <>{skeleton}</>;
  if (query.isError) {
    return (
      <ErrorState message={errorMessage} error={query.error} onRetry={() => query.refetch()} />
    );
  }
  if (query.data === undefined) return <>{skeleton}</>;
  if (isEmpty && empty && isEmpty(query.data)) return <>{empty}</>;
  return <>{children(query.data)}</>;
};

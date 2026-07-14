import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui';
import { useSilentRefresh } from '@/hooks';

export const RootGate = ({ children }: { children: ReactNode }) => {
  const { ready } = useSilentRefresh();

  if (!ready) {
    return (
      <div className="center-viewport text-brand-600">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

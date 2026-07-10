import type { ReactNode } from 'react';
import { Spinner } from '@/components/ui';
import { useSilentRefresh } from '@/hooks';

// Holds rendering until the one-shot silent refresh resolves, so an
// authenticated hard-refresh doesn't flash the login screen.
export const RootGate = ({ children }: { children: ReactNode }) => {
  const { ready } = useSilentRefresh();

  if (!ready) {
    return (
      <div className="flex min-h-full items-center justify-center text-brand-600">
        <Spinner size="lg" />
      </div>
    );
  }

  return <>{children}</>;
};

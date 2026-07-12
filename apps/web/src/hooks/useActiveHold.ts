import { useSyncExternalStore } from 'react';
import { holdStore } from '@/lib';

// React binding for the hold store — re-renders when the active hold changes.
export const useActiveHold = () => {
  const state = useSyncExternalStore(holdStore.subscribe, holdStore.getState, holdStore.getState);
  return { activeHold: state.activeHold };
};

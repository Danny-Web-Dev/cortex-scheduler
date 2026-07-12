import { holdStore } from '@/state/hold';
import { useStore } from './useStore';

// React binding for the hold store — re-renders when the active hold changes.
export const useActiveHold = () => {
  const { activeHold } = useStore(holdStore);
  return { activeHold };
};

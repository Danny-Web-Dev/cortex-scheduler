import { holdStore } from '@/state/hold';
import { useStore } from './useStore';

export const useActiveHold = () => {
  const { activeHold } = useStore(holdStore);
  return { activeHold };
};

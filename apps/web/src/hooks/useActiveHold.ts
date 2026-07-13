import { useStore } from 'zustand';
import { holdStore } from '@/state/hold';

export const useActiveHold = () => {
  const { activeHold } = useStore(holdStore);
  return { activeHold };
};

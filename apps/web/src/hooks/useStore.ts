import { useSyncExternalStore } from 'react';

type ExternalStore<T> = {
  subscribe: (listener: () => void) => () => void;
  getState: () => T;
};

// Shared useSyncExternalStore binding for the hand-rolled stores in state/*.
export const useStore = <T,>(store: ExternalStore<T>): T =>
  useSyncExternalStore(store.subscribe, store.getState, store.getState);

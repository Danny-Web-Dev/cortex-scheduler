type Listener = () => void;

// Minimal observable store: module-level singletons (authStore, holdStore)
// build on this instead of hand-rolling the same listener-set boilerplate.
export const createStore = <T,>(initial: T) => {
  let state = initial;
  const listeners = new Set<Listener>();
  const emit = () => listeners.forEach((listener) => listener());

  return {
    getState: (): T => state,
    subscribe: (listener: Listener): (() => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setState: (updater: (prev: T) => T): void => {
      state = updater(state);
      emit();
    },
  };
};

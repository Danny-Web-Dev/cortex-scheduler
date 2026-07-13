import { createStore } from 'zustand/vanilla';
import { AppointmentSchema, type Appointment } from '@cortex/shared';

const STORAGE_KEY = 'cortex.active-hold';

type HoldState = { activeHold: Appointment | null };

const isLiveHold = (appointment: Appointment): boolean => {
  if (appointment.status !== 'HELD') return false;
  if (appointment.holdExpiresAt === null) return false;
  return new Date(appointment.holdExpiresAt).getTime() > Date.now();
};

const readStoredJson = (raw: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
};

const hydrate = (): Appointment | null => {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (raw === null) return null;

  const parsed = AppointmentSchema.safeParse(readStoredJson(raw));
  if (!parsed.success || !isLiveHold(parsed.data)) {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
  return parsed.data;
};

const store = createStore<HoldState>()(() => ({ activeHold: hydrate() }));

export const holdStore = {
  getState: store.getState,
  getInitialState: store.getInitialState,
  subscribe: store.subscribe,
  setHold: (appointment: Appointment): void => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(appointment));
    store.setState({ activeHold: appointment });
  },
  clear: (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    store.setState({ activeHold: null });
  },
};

import { AppointmentSchema, type Appointment } from '@cortex/shared';
import { createStore } from '../createStore';

// The active hold survives page refreshes (sessionStorage) and navigation away
// from the booking flow, so the floating hold toast can bring the user back to
// the confirm step. Session-scoped on purpose: a hold is short-lived and
// per-tab, and holds nothing sensitive (no tokens).
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
    // Corrupt storage — recover by treating it as absent.
    return null;
  }
};

// Storage is external input: validate with the shared schema and drop anything
// stale so a dead hold never resurfaces after a refresh.
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

const store = createStore<HoldState>({ activeHold: hydrate() });

export const holdStore = {
  getState: store.getState,
  subscribe: store.subscribe,
  setHold: (appointment: Appointment): void => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(appointment));
    store.setState(() => ({ activeHold: appointment }));
  },
  clear: (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    store.setState(() => ({ activeHold: null }));
  },
};

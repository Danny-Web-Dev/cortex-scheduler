import { AppointmentSchema, type Appointment } from '@cortex/shared';

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

let state: HoldState = { activeHold: hydrate() };
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

export const holdStore = {
  getState: (): HoldState => state,
  subscribe: (listener: () => void): (() => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  setHold: (appointment: Appointment): void => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(appointment));
    state = { activeHold: appointment };
    emit();
  },
  clear: (): void => {
    sessionStorage.removeItem(STORAGE_KEY);
    state = { activeHold: null };
    emit();
  },
};

import { DateTime } from 'luxon';
import type { Slot } from '@cortex/shared';
import type { AvailabilityWindow, ComputeFreeSlotsArgs, OccupyingAppointment } from '@/types';

const isOccupying = (appt: OccupyingAppointment, now: Date): boolean => {
  if (appt.status === 'CONFIRMED') return true;
  if (appt.status === 'COMPLETED') return true;
  if (appt.status === 'HELD') return appt.holdExpiresAt !== null && appt.holdExpiresAt > now;
  return false;
};

const windowSlots = (window: AvailabilityWindow, date: string, tz: string, durationMin: number,): DateTime[] => {
  const start = DateTime.fromISO(`${date}T${window.startTime}`, { zone: tz });
  const end = DateTime.fromISO(`${date}T${window.endTime}`, { zone: tz });
  if (!start.isValid || !end.isValid) return [];

  const slots: DateTime[] = [];
  let cursor = start;
  while (cursor.plus({ minutes: durationMin }) <= end) {
    slots.push(cursor);
    cursor = cursor.plus({ minutes: durationMin });
  }
  return slots;
};

export const computeFreeSlots = (args: ComputeFreeSlotsArgs): Slot[] => {
  const { availability, appointments, date, tz, durationMin, now } = args;

  const weekday = DateTime.fromISO(date, { zone: tz }).weekday;
  const windows = availability.filter((w) => w.weekday === weekday);

  const occupied = new Set<number>(
    appointments.filter((a) => isOccupying(a, now)).map((a) => a.startsAt.getTime()),
  );

  const nowMs = now.getTime();
  const result: Slot[] = [];

  for (const window of windows) {
    for (const slotStart of windowSlots(window, date, tz, durationMin)) {
      const instant = slotStart.toUTC();
      const ms = instant.toMillis();
      if (ms <= nowMs) continue;
      if (occupied.has(ms)) continue;
      const iso = instant.toISO();
      if (!iso) continue;
      result.push({ startsAt: iso, durationMin });
    }
  }

  return result.sort((a, b) => a.startsAt.localeCompare(b.startsAt));
};

export const isFreeSlot = (startsAtIso: string, freeSlots: Slot[]): boolean => freeSlots.some((s) => s.startsAt === startsAtIso);

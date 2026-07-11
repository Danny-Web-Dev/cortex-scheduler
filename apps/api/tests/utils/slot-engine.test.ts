import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import { computeFreeSlots, isFreeSlot } from '../../utils';
import type { AvailabilityWindow } from '../../types';

const TZ = 'Asia/Jerusalem';
const DURATION = 30;

const availabilityFor = (date: string, startTime = '09:00', endTime = '17:00'): AvailabilityWindow[] => {
  const weekday = DateTime.fromISO(date, { zone: TZ }).weekday;
  return [{ weekday, startTime, endTime }];
};

const dayBefore = (date: string): Date =>
  DateTime.fromISO(date, { zone: TZ }).minus({ days: 1 }).toUTC().toJSDate();

describe('computeFreeSlots', () => {
  it('generates a full grid stepped by durationMin within the window', () => {
    const date = '2026-07-13';
    const slots = computeFreeSlots({
      availability: availabilityFor(date),
      appointments: [],
      date,
      tz: TZ,
      durationMin: DURATION,
      now: dayBefore(date),
    });
    expect(slots).toHaveLength(16);
    expect(slots[0]?.durationMin).toBe(DURATION);
  });

  it('converts clinic-local time to UTC using summer DST offset (IDT, UTC+3)', () => {
    const date = '2026-07-13';
    const slots = computeFreeSlots({
      availability: availabilityFor(date),
      appointments: [],
      date,
      tz: TZ,
      durationMin: DURATION,
      now: dayBefore(date),
    });
    expect(slots[0]?.startsAt).toBe('2026-07-13T06:00:00.000Z');
  });

  it('converts clinic-local time to UTC using winter offset (IST, UTC+2)', () => {
    const date = '2026-01-12';
    const slots = computeFreeSlots({
      availability: availabilityFor(date),
      appointments: [],
      date,
      tz: TZ,
      durationMin: DURATION,
      now: dayBefore(date),
    });
    expect(slots[0]?.startsAt).toBe('2026-01-12T07:00:00.000Z');
  });

  it('returns nothing on a weekday with no availability', () => {
    const date = '2026-07-13';
    const otherWeekday = (DateTime.fromISO(date, { zone: TZ }).weekday % 7) + 1;
    const slots = computeFreeSlots({
      availability: [{ weekday: otherWeekday, startTime: '09:00', endTime: '17:00' }],
      appointments: [],
      date,
      tz: TZ,
      durationMin: DURATION,
      now: dayBefore(date),
    });
    expect(slots).toHaveLength(0);
  });

  it('excludes a CONFIRMED appointment from the free slots', () => {
    const date = '2026-07-13';
    const taken = '2026-07-13T06:00:00.000Z';
    const slots = computeFreeSlots({
      availability: availabilityFor(date),
      appointments: [{ startsAt: new Date(taken), status: 'CONFIRMED', holdExpiresAt: null }],
      date,
      tz: TZ,
      durationMin: DURATION,
      now: dayBefore(date),
    });
    expect(isFreeSlot(taken, slots)).toBe(false);
    expect(slots).toHaveLength(15);
  });

  it('excludes a non-expired HELD appointment', () => {
    const date = '2026-07-13';
    const held = '2026-07-13T06:00:00.000Z';
    const now = dayBefore(date);
    const slots = computeFreeSlots({
      availability: availabilityFor(date),
      appointments: [
        { startsAt: new Date(held), status: 'HELD', holdExpiresAt: new Date(now.getTime() + 60_000) },
      ],
      date,
      tz: TZ,
      durationMin: DURATION,
      now,
    });
    expect(isFreeSlot(held, slots)).toBe(false);
  });

  it('reclaims an expired HELD appointment as free (lazy expiry)', () => {
    const date = '2026-07-13';
    const held = '2026-07-13T06:00:00.000Z';
    const now = dayBefore(date);
    const slots = computeFreeSlots({
      availability: availabilityFor(date),
      appointments: [
        { startsAt: new Date(held), status: 'HELD', holdExpiresAt: new Date(now.getTime() - 60_000) },
      ],
      date,
      tz: TZ,
      durationMin: DURATION,
      now,
    });
    expect(isFreeSlot(held, slots)).toBe(true);
    expect(slots).toHaveLength(16);
  });

  it('filters out slots already in the past relative to now', () => {
    const date = '2026-07-13';
    const now = DateTime.fromISO(`${date}T12:00`, { zone: TZ }).toUTC().toJSDate();
    const slots = computeFreeSlots({
      availability: availabilityFor(date),
      appointments: [],
      date,
      tz: TZ,
      durationMin: DURATION,
      now,
    });
    expect(slots.every((s) => new Date(s.startsAt).getTime() > now.getTime())).toBe(true);
    expect(isFreeSlot('2026-07-13T06:00:00.000Z', slots)).toBe(false);
  });
});

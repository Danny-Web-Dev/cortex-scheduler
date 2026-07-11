import { describe, expect, it } from 'vitest';
import {
  effectiveStatus,
  isEffectivelyCompleted,
  isEndedConfirmed,
  toAppointmentDto,
} from '@/utils';
import type { AppointmentWithRelations } from '@/types';

const NOW = new Date('2026-07-11T12:00:00.000Z');
const DURATION_MIN = 30;

// Started 10:00, ended 10:30 — before NOW.
const endedStart = new Date('2026-07-11T10:00:00.000Z');
// Starts 14:00 — after NOW.
const futureStart = new Date('2026-07-11T14:00:00.000Z');

describe('isEndedConfirmed', () => {
  it('is true for a CONFIRMED appointment whose end instant has passed', () => {
    expect(
      isEndedConfirmed({ status: 'CONFIRMED', startsAt: endedStart, durationMin: DURATION_MIN }, NOW),
    ).toBe(true);
  });

  it('is false for a CONFIRMED appointment still in the future', () => {
    expect(
      isEndedConfirmed({ status: 'CONFIRMED', startsAt: futureStart, durationMin: DURATION_MIN }, NOW),
    ).toBe(false);
  });

  it('is false while a CONFIRMED appointment is in progress (started, not ended)', () => {
    // Starts 11:45, ends 12:15 — spans NOW (12:00), so not yet ended.
    const inProgress = new Date('2026-07-11T11:45:00.000Z');
    expect(
      isEndedConfirmed({ status: 'CONFIRMED', startsAt: inProgress, durationMin: DURATION_MIN }, NOW),
    ).toBe(false);
  });

  it('is false for non-CONFIRMED statuses regardless of time', () => {
    expect(
      isEndedConfirmed({ status: 'HELD', startsAt: endedStart, durationMin: DURATION_MIN }, NOW),
    ).toBe(false);
    expect(
      isEndedConfirmed({ status: 'CANCELLED', startsAt: endedStart, durationMin: DURATION_MIN }, NOW),
    ).toBe(false);
  });
});

describe('effectiveStatus', () => {
  it('surfaces an ended CONFIRMED appointment as COMPLETED', () => {
    expect(
      effectiveStatus({ status: 'CONFIRMED', startsAt: endedStart, durationMin: DURATION_MIN }, NOW),
    ).toBe('COMPLETED');
  });

  it('leaves a future CONFIRMED appointment as CONFIRMED', () => {
    expect(
      effectiveStatus({ status: 'CONFIRMED', startsAt: futureStart, durationMin: DURATION_MIN }, NOW),
    ).toBe('CONFIRMED');
  });

  it('leaves CANCELLED and HELD untouched', () => {
    expect(
      effectiveStatus({ status: 'CANCELLED', startsAt: endedStart, durationMin: DURATION_MIN }, NOW),
    ).toBe('CANCELLED');
    expect(
      effectiveStatus({ status: 'HELD', startsAt: futureStart, durationMin: DURATION_MIN }, NOW),
    ).toBe('HELD');
  });
});

describe('isEffectivelyCompleted', () => {
  it('is true for a row already persisted as COMPLETED', () => {
    expect(
      isEffectivelyCompleted(
        { status: 'COMPLETED', startsAt: futureStart, durationMin: DURATION_MIN },
        NOW,
      ),
    ).toBe(true);
  });

  it('is true for an ended CONFIRMED row not yet relabelled', () => {
    expect(
      isEffectivelyCompleted(
        { status: 'CONFIRMED', startsAt: endedStart, durationMin: DURATION_MIN },
        NOW,
      ),
    ).toBe(true);
  });

  it('is false for an active future CONFIRMED row', () => {
    expect(
      isEffectivelyCompleted(
        { status: 'CONFIRMED', startsAt: futureStart, durationMin: DURATION_MIN },
        NOW,
      ),
    ).toBe(false);
  });
});

describe('toAppointmentDto', () => {
  const baseRow: AppointmentWithRelations = {
    id: 'appt_1',
    doctorId: 'doc_1',
    specialtyId: 'spec_1',
    startsAt: new Date('2020-01-01T10:00:00.000Z'),
    durationMin: DURATION_MIN,
    status: 'CONFIRMED',
    holdExpiresAt: null,
    notes: null,
    doctor: { name: 'Dr. Noa' },
    specialty: { name: 'Cardiology' },
  };

  it('maps a long-past CONFIRMED appointment to COMPLETED', () => {
    expect(toAppointmentDto(baseRow).status).toBe('COMPLETED');
  });

  it('keeps a far-future CONFIRMED appointment as CONFIRMED', () => {
    const future = { ...baseRow, startsAt: new Date('2999-01-01T10:00:00.000Z') };
    expect(toAppointmentDto(future).status).toBe('CONFIRMED');
  });

  it('carries doctor and specialty names through', () => {
    const dto = toAppointmentDto(baseRow);
    expect(dto.doctorName).toBe('Dr. Noa');
    expect(dto.specialtyName).toBe('Cardiology');
  });
});

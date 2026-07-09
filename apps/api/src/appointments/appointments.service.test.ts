import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppointmentsService } from './appointments.service';
import {
  HoldExpiredException,
  SlotTakenException,
  ValidationException,
} from '../common/exceptions';
import type { PrismaService } from '../prisma';
import type { ConfigService } from '../config';
import type { DoctorsService, FreeSlotsContext } from '../doctors';

const DOCTOR_ID = 'doctor-1';
const SPECIALTY_ID = 'spec-1';
const FREE_SLOT = '2026-07-13T06:00:00.000Z';
const DURATION = 30;

const relationRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'appt-1',
  doctorId: DOCTOR_ID,
  specialtyId: SPECIALTY_ID,
  startsAt: new Date(FREE_SLOT),
  durationMin: DURATION,
  status: 'HELD' as const,
  holdExpiresAt: new Date(Date.now() + 60_000),
  notes: null,
  doctor: { name: 'Dr. A' },
  specialty: { name: 'Cardiology' },
  ...overrides,
});

const buildService = (opts: {
  freeSlots?: string[];
  createImpl?: () => unknown;
  findFirst?: unknown;
}) => {
  const create = vi.fn().mockImplementation(opts.createImpl ?? (() => relationRow()));
  const deleteMany = vi.fn().mockResolvedValue({ count: 0 });
  const update = vi.fn().mockResolvedValue(relationRow({ status: 'CONFIRMED' }));
  const findFirst = vi.fn().mockResolvedValue(opts.findFirst ?? null);

  const tx = { appointment: { deleteMany, create, update } };
  const prisma = {
    appointment: { findFirst, update, deleteMany },
    $transaction: vi.fn(async (cb: (t: unknown) => Promise<unknown>) => cb(tx)),
  } as unknown as PrismaService;

  const context: FreeSlotsContext = {
    doctorId: DOCTOR_ID,
    specialtyId: SPECIALTY_ID,
    durationMin: DURATION,
    slots: (opts.freeSlots ?? [FREE_SLOT]).map((s) => ({ startsAt: s, durationMin: DURATION })),
  };
  const doctors = {
    computeFreeSlotsForDate: vi.fn().mockResolvedValue(context),
  } as unknown as DoctorsService;

  const config = { clinicTz: 'Asia/Jerusalem' } as unknown as ConfigService;

  return { service: new AppointmentsService(prisma, config, doctors), create, findFirst };
};

describe('AppointmentsService.hold', () => {
  beforeEach(() => vi.clearAllMocks());

  it('holds a slot that is currently free', async () => {
    const { service, create } = buildService({ freeSlots: [FREE_SLOT] });
    const result = await service.hold('user-1', { doctorId: DOCTOR_ID, startsAt: FREE_SLOT });
    expect(result.status).toBe('HELD');
    expect(create).toHaveBeenCalledOnce();
  });

  it('rejects an off-grid startsAt not in the computed free slots', async () => {
    const { service, create } = buildService({ freeSlots: ['2026-07-13T06:30:00.000Z'] });
    await expect(
      service.hold('user-1', { doctorId: DOCTOR_ID, startsAt: FREE_SLOT }),
    ).rejects.toBeInstanceOf(ValidationException);
    expect(create).not.toHaveBeenCalled();
  });

  it('maps a unique-constraint race to a 409 SlotTaken', async () => {
    const { service } = buildService({
      freeSlots: [FREE_SLOT],
      createImpl: () => {
        throw { code: 'P2002' };
      },
    });
    await expect(
      service.hold('user-1', { doctorId: DOCTOR_ID, startsAt: FREE_SLOT }),
    ).rejects.toBeInstanceOf(SlotTakenException);
  });
});

describe('AppointmentsService.confirm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('confirms a held slot that has not expired', async () => {
    const { service } = buildService({
      findFirst: relationRow({ holdExpiresAt: new Date(Date.now() + 60_000) }),
    });
    const result = await service.confirm('user-1', 'appt-1');
    expect(result.status).toBe('CONFIRMED');
  });

  it('rejects confirming an expired hold with 410 HoldExpired', async () => {
    const { service } = buildService({
      findFirst: relationRow({ holdExpiresAt: new Date(Date.now() - 60_000) }),
    });
    await expect(service.confirm('user-1', 'appt-1')).rejects.toBeInstanceOf(HoldExpiredException);
  });
});

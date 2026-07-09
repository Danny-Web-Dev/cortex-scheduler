import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import type {
  Appointment as AppointmentDto,
  AppointmentScope,
  HoldAppointmentInput,
  RescheduleAppointmentInput,
} from '@cortex/shared';
import { PrismaService } from '../prisma';
import { ConfigService } from '../config';
import { DoctorsService, isFreeSlot } from '../doctors';
import {
  HoldExpiredException,
  NotFoundException,
  SlotTakenException,
  ValidationException,
} from '../common/exceptions';
import { isUniqueConstraintViolation } from '../common/prisma-errors';
import { toAppointmentDto } from './appointment.mapper';
import { HOLD_TTL_MIN, slotKeyFor } from './appointments.constants';

const MS_PER_MIN = 60 * 1000;

const APPOINTMENT_INCLUDE = {
  doctor: { select: { name: true } },
  specialty: { select: { name: true } },
} as const;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly doctors: DoctorsService,
  ) {}

  async hold(userId: string, input: HoldAppointmentInput): Promise<AppointmentDto> {
    const context = await this.validateSlot(input.doctorId, input.startsAt);

    const startsAt = new Date(input.startsAt);
    const slotKey = slotKeyFor(input.doctorId, input.startsAt);
    const holdExpiresAt = new Date(Date.now() + HOLD_TTL_MIN * MS_PER_MIN);

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        await tx.appointment.deleteMany({
          where: { slotKey, status: 'HELD', holdExpiresAt: { lt: new Date() } },
        });
        return tx.appointment.create({
          data: {
            userId,
            doctorId: input.doctorId,
            specialtyId: context.specialtyId,
            startsAt,
            durationMin: context.durationMin,
            status: 'HELD',
            holdExpiresAt,
            slotKey,
          },
          include: APPOINTMENT_INCLUDE,
        });
      });
      return toAppointmentDto(created);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) throw new SlotTakenException();
      throw error;
    }
  }

  async confirm(userId: string, id: string): Promise<AppointmentDto> {
    const appointment = await this.prisma.appointment.findFirst({ where: { id, userId } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.status !== 'HELD') {
      throw new ValidationException('Appointment is not awaiting confirmation');
    }
    if (!appointment.holdExpiresAt || appointment.holdExpiresAt <= new Date()) {
      throw new HoldExpiredException();
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CONFIRMED', holdExpiresAt: null },
      include: APPOINTMENT_INCLUDE,
    });
    return toAppointmentDto(updated);
  }

  // Best-effort release when the user abandons the confirm step.
  async releaseHold(userId: string, id: string): Promise<void> {
    await this.prisma.appointment.deleteMany({ where: { id, userId, status: 'HELD' } });
  }

  async listMine(userId: string, scope: AppointmentScope): Promise<AppointmentDto[]> {
    const now = new Date();
    const upcoming = scope === 'upcoming';

    const rows = await this.prisma.appointment.findMany({
      where: {
        userId,
        startsAt: upcoming ? { gte: now } : { lt: now },
        status: upcoming ? 'CONFIRMED' : { in: ['CONFIRMED', 'COMPLETED', 'CANCELLED'] },
      },
      orderBy: { startsAt: upcoming ? 'asc' : 'desc' },
      include: APPOINTMENT_INCLUDE,
    });
    return rows.map(toAppointmentDto);
  }

  async cancel(userId: string, id: string): Promise<AppointmentDto> {
    const appointment = await this.prisma.appointment.findFirst({ where: { id, userId } });
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.status === 'COMPLETED') {
      throw new ValidationException('Cannot cancel a completed appointment');
    }

    const updated = await this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED', slotKey: null, holdExpiresAt: null },
      include: APPOINTMENT_INCLUDE,
    });
    return toAppointmentDto(updated);
  }

  // Reschedule = cancel the old slot + confirm the new one, atomically.
  async reschedule(
    userId: string,
    id: string,
    input: RescheduleAppointmentInput,
  ): Promise<AppointmentDto> {
    const existing = await this.prisma.appointment.findFirst({ where: { id, userId } });
    if (!existing) throw new NotFoundException('Appointment not found');
    if (existing.status !== 'CONFIRMED' && existing.status !== 'HELD') {
      throw new ValidationException('Only active appointments can be rescheduled');
    }

    const context = await this.validateSlot(existing.doctorId, input.startsAt);

    const newStartsAt = new Date(input.startsAt);
    const newSlotKey = slotKeyFor(existing.doctorId, input.startsAt);

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        await tx.appointment.update({
          where: { id },
          data: { status: 'CANCELLED', slotKey: null, holdExpiresAt: null },
        });
        await tx.appointment.deleteMany({
          where: { slotKey: newSlotKey, status: 'HELD', holdExpiresAt: { lt: new Date() } },
        });
        return tx.appointment.create({
          data: {
            userId,
            doctorId: existing.doctorId,
            specialtyId: existing.specialtyId,
            startsAt: newStartsAt,
            durationMin: context.durationMin,
            status: 'CONFIRMED',
            slotKey: newSlotKey,
          },
          include: APPOINTMENT_INCLUDE,
        });
      });
      return toAppointmentDto(created);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) throw new SlotTakenException();
      throw error;
    }
  }

  // Re-validate against freshly computed free slots — never trust the client's
  // timestamp — and return the same context so callers don't recompute it.
  private async validateSlot(doctorId: string, startsAtIso: string) {
    const context = await this.doctors.computeFreeSlotsForDate(
      doctorId,
      this.clinicDateOf(startsAtIso),
    );
    if (!isFreeSlot(startsAtIso, context.slots)) {
      throw new ValidationException('Selected time is not an available slot');
    }
    return context;
  }

  private clinicDateOf(startsAtIso: string): string {
    const date = DateTime.fromISO(startsAtIso, { zone: 'utc' })
      .setZone(this.config.clinicTz)
      .toISODate();
    if (!date) throw new ValidationException('Invalid startsAt');
    return date;
  }
}

import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import type {
  Appointment as AppointmentDto,
  AppointmentScope,
  HoldAppointmentInput,
  RescheduleAppointmentInput,
} from '@cortex/shared';
import { PrismaService } from '@/models';
import { ConfigService } from '@/config';
import { AppointmentRepository } from '@/repositories';
import {
  HOLD_TTL_MIN,
  HoldExpiredException,
  NotFoundException,
  SlotTakenException,
  ValidationException,
  isEffectivelyCompleted,
  isEndedConfirmed,
  isFreeSlot,
  isUniqueConstraintViolation,
  slotKeyFor,
  toAppointmentDto,
} from '@/utils';
import { DoctorsService } from './doctors.service';

const MS_PER_MIN = 60 * 1000;

@Injectable()
export class AppointmentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly doctors: DoctorsService,
    private readonly appointments: AppointmentRepository,
  ) {}

  async hold(userId: string, input: HoldAppointmentInput): Promise<AppointmentDto> {
    const context = await this.validateSlot(input.doctorId, input.startsAt);

    const startsAt = new Date(input.startsAt);
    const slotKey = slotKeyFor(input.doctorId, input.startsAt);
    const holdExpiresAt = new Date(Date.now() + HOLD_TTL_MIN * MS_PER_MIN);

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        await this.appointments.deleteExpiredHeldBySlotKey(slotKey, tx);
        return this.appointments.create(
          {
            userId,
            doctorId: input.doctorId,
            specialtyId: context.specialtyId,
            startsAt,
            durationMin: context.durationMin,
            status: 'HELD',
            holdExpiresAt,
            slotKey,
          },
          tx,
        );
      });
      return toAppointmentDto(created);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) throw new SlotTakenException();
      throw error;
    }
  }

  async confirm(userId: string, id: string): Promise<AppointmentDto> {
    const appointment = await this.appointments.findByIdForUser(id, userId);
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (appointment.status !== 'HELD') {
      throw new ValidationException('Appointment is not awaiting confirmation');
    }
    if (!appointment.holdExpiresAt || appointment.holdExpiresAt <= new Date()) {
      throw new HoldExpiredException();
    }

    const updated = await this.appointments.updateStatus(id, {
      status: 'CONFIRMED',
      holdExpiresAt: null,
    });
    return toAppointmentDto(updated);
  }

  async releaseHold(userId: string, id: string): Promise<void> {
    await this.appointments.deleteOwnHeld(id, userId);
  }

  async listMine(userId: string, scope: AppointmentScope): Promise<AppointmentDto[]> {
    const rows = await this.appointments.findMine(userId, scope === 'upcoming');
    return rows.map(toAppointmentDto);
  }

  async cancel(userId: string, id: string): Promise<AppointmentDto> {
    const appointment = await this.appointments.findByIdForUser(id, userId);
    if (!appointment) throw new NotFoundException('Appointment not found');
    if (isEffectivelyCompleted(appointment, new Date())) {
      throw new ValidationException('Cannot cancel a completed appointment');
    }

    const updated = await this.appointments.updateStatus(id, {
      status: 'CANCELLED',
      slotKey: null,
      holdExpiresAt: null,
    });
    return toAppointmentDto(updated);
  }

  async reschedule(
    userId: string,
    id: string,
    input: RescheduleAppointmentInput,
  ): Promise<AppointmentDto> {
    const existing = await this.appointments.findByIdForUser(id, userId);
    if (!existing) throw new NotFoundException('Appointment not found');
    const reschedulable =
      (existing.status === 'CONFIRMED' || existing.status === 'HELD') &&
      !isEndedConfirmed(existing, new Date());
    if (!reschedulable) {
      throw new ValidationException('Only active appointments can be rescheduled');
    }

    const context = await this.validateSlot(existing.doctorId, input.startsAt);

    const newStartsAt = new Date(input.startsAt);
    const newSlotKey = slotKeyFor(existing.doctorId, input.startsAt);

    try {
      const created = await this.prisma.$transaction(async (tx) => {
        await this.appointments.updateStatus(
          id,
          { status: 'CANCELLED', slotKey: null, holdExpiresAt: null },
          tx,
        );
        await this.appointments.deleteExpiredHeldBySlotKey(newSlotKey, tx);
        return this.appointments.create(
          {
            userId,
            doctorId: existing.doctorId,
            specialtyId: existing.specialtyId,
            startsAt: newStartsAt,
            durationMin: context.durationMin,
            status: 'CONFIRMED',
            slotKey: newSlotKey,
          },
          tx,
        );
      });
      return toAppointmentDto(created);
    } catch (error) {
      if (isUniqueConstraintViolation(error)) throw new SlotTakenException();
      throw error;
    }
  }

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

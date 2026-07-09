import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import type { Slot, SlotsResponse } from '@cortex/shared';
import { PrismaService } from '../prisma';
import { ConfigService } from '../config';
import { NotFoundException, ValidationException } from '../common/exceptions';
import { computeFreeSlots } from './slot-engine';

export type FreeSlotsContext = {
  doctorId: string;
  specialtyId: string;
  durationMin: number;
  slots: Slot[];
};

// Statuses that can still occupy a slot; CANCELLED never blocks.
const ACTIVE_STATUSES = ['HELD', 'CONFIRMED', 'COMPLETED'] as const;

@Injectable()
export class DoctorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  // Shared by the slots endpoint and the hold flow so both agree on what's free.
  async computeFreeSlotsForDate(doctorId: string, date: string): Promise<FreeSlotsContext> {
    const tz = this.config.clinicTz;
    const dayStart = DateTime.fromISO(date, { zone: tz }).startOf('day');
    if (!dayStart.isValid) throw new ValidationException('Invalid date');

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: { specialty: true, availability: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    const dayStartJs = dayStart.toUTC().toJSDate();
    const dayEndJs = dayStart.plus({ days: 1 }).toUTC().toJSDate();

    const appointments = await this.prisma.appointment.findMany({
      where: {
        doctorId,
        status: { in: [...ACTIVE_STATUSES] },
        startsAt: { gte: dayStartJs, lt: dayEndJs },
      },
      select: { startsAt: true, status: true, holdExpiresAt: true },
    });

    const slots = computeFreeSlots({
      availability: doctor.availability,
      appointments,
      date,
      tz,
      durationMin: doctor.specialty.avgDurationMin,
      now: new Date(),
    });

    return {
      doctorId,
      specialtyId: doctor.specialtyId,
      durationMin: doctor.specialty.avgDurationMin,
      slots,
    };
  }

  async getSlots(doctorId: string, date: string): Promise<SlotsResponse> {
    const context = await this.computeFreeSlotsForDate(doctorId, date);
    return { doctorId, date, slots: context.slots };
  }
}

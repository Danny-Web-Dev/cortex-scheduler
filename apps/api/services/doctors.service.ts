import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';
import type { SlotsResponse } from '@cortex/shared';
import { ConfigService } from '@/config';
import { AppointmentRepository, DoctorRepository } from '@/repositories';
import { NotFoundException, ValidationException, computeFreeSlots } from '@/utils';
import type { FreeSlotsContext } from '@/types';

@Injectable()
export class DoctorsService {
  constructor(
    private readonly config: ConfigService,
    private readonly doctors: DoctorRepository,
    private readonly appointments: AppointmentRepository,
  ) {}
  
  async computeFreeSlotsForDate(doctorId: string, date: string): Promise<FreeSlotsContext> {
    const tz = this.config.clinicTz;
    const dayStart = DateTime.fromISO(date, { zone: tz }).startOf('day');
    if (!dayStart.isValid) throw new ValidationException('Invalid date');

    const doctor = await this.doctors.findByIdWithSchedule(doctorId);
    if (!doctor) throw new NotFoundException('Doctor not found');

    const from = dayStart.toUTC().toJSDate();
    const to = dayStart.plus({ days: 1 }).toUTC().toJSDate();
    const appointments = await this.appointments.findOccupancyForDoctorBetween(doctorId, from, to);

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

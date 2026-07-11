import { Injectable } from '@nestjs/common';
import type { Appointment, AppointmentStatus } from '@prisma/client';
import { PrismaService } from '../models';
import type {
  AppointmentStatusUpdate,
  AppointmentWithRelations,
  CreateAppointment,
  PrismaExecutor,
  SlotOccupancy,
} from '../types';

const ACTIVE_STATUSES: AppointmentStatus[] = ['HELD', 'CONFIRMED', 'COMPLETED'];

const WITH_NAMES = {
  doctor: { select: { name: true } },
  specialty: { select: { name: true } },
} as const;

@Injectable()
export class AppointmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  findOccupancyForDoctorBetween(doctorId: string, from: Date, to: Date): Promise<SlotOccupancy[]> {
    return this.prisma.appointment.findMany({
      where: { doctorId, status: { in: ACTIVE_STATUSES }, startsAt: { gte: from, lt: to } },
      select: { startsAt: true, status: true, holdExpiresAt: true },
    });
  }

  findByIdForUser(id: string, userId: string): Promise<Appointment | null> {
    return this.prisma.appointment.findFirst({ where: { id, userId } });
  }

  findMine(userId: string, upcoming: boolean): Promise<AppointmentWithRelations[]> {
    const now = new Date();
    return this.prisma.appointment.findMany({
      where: {
        userId,
        startsAt: upcoming ? { gte: now } : { lt: now },
        status: upcoming ? 'CONFIRMED' : { in: ['CONFIRMED', 'COMPLETED', 'CANCELLED'] },
      },
      orderBy: { startsAt: upcoming ? 'asc' : 'desc' },
      include: WITH_NAMES,
    });
  }

  async deleteExpiredHeldBySlotKey(slotKey: string, tx?: PrismaExecutor): Promise<void> {
    await (tx ?? this.prisma).appointment.deleteMany({
      where: { slotKey, status: 'HELD', holdExpiresAt: { lt: new Date() } },
    });
  }

  async deleteOwnHeld(id: string, userId: string): Promise<void> {
    await this.prisma.appointment.deleteMany({ where: { id, userId, status: 'HELD' } });
  }

  create(data: CreateAppointment, tx?: PrismaExecutor): Promise<AppointmentWithRelations> {
    return (tx ?? this.prisma).appointment.create({ data, include: WITH_NAMES });
  }

  updateStatus(
    id: string,
    data: AppointmentStatusUpdate,
    tx?: PrismaExecutor,
  ): Promise<AppointmentWithRelations> {
    return (tx ?? this.prisma).appointment.update({ where: { id }, data, include: WITH_NAMES });
  }
}

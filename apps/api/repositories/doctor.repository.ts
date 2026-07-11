import { Injectable } from '@nestjs/common';
import type { Doctor } from '../models';
import { PrismaService } from '../models';
import type { DoctorWithSchedule, DoctorWithSpecialtyName } from '../types';

const SEARCH_LIMIT = 10;

@Injectable()
export class DoctorRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySpecialty(specialtyId: string): Promise<Doctor[]> {
    return this.prisma.doctor.findMany({
      where: { specialtyId },
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
    });
  }

  findByIdWithSchedule(id: string): Promise<DoctorWithSchedule | null> {
    return this.prisma.doctor.findUnique({
      where: { id },
      include: { specialty: true, availability: true },
    });
  }

  search(term: string): Promise<DoctorWithSpecialtyName[]> {
    return this.prisma.doctor.findMany({
      where: { OR: [{ name: { contains: term } }, { bio: { contains: term } }] },
      include: { specialty: { select: { name: true } } },
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
      take: SEARCH_LIMIT,
    });
  }
}

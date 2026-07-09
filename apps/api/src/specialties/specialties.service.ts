import { Injectable } from '@nestjs/common';
import type { Doctor, Specialty } from '@cortex/shared';
import { PrismaService } from '../prisma';
import { NotFoundException } from '../common/exceptions';

@Injectable()
export class SpecialtiesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<Specialty[]> {
    const rows = await this.prisma.specialty.findMany({ orderBy: { name: 'asc' } });
    return rows.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      icon: s.icon,
      avgDurationMin: s.avgDurationMin,
    }));
  }

  async listDoctors(specialtyId: string): Promise<Doctor[]> {
    const specialty = await this.prisma.specialty.findUnique({ where: { id: specialtyId } });
    if (!specialty) throw new NotFoundException('Specialty not found');

    const rows = await this.prisma.doctor.findMany({
      where: { specialtyId },
      orderBy: [{ rating: 'desc' }, { name: 'asc' }],
    });
    return rows.map((d) => ({
      id: d.id,
      name: d.name,
      specialtyId: d.specialtyId,
      yearsExperience: d.yearsExperience,
      rating: d.rating,
      bio: d.bio,
    }));
  }
}

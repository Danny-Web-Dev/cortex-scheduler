import { Injectable } from '@nestjs/common';
import type { SearchResult } from '@cortex/shared';
import { PrismaService } from '../prisma';

const RESULT_LIMIT = 10;

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  // Smart search across specialties and doctors in one query. MySQL's default
  // collation is case-insensitive, so `contains` matches regardless of case.
  async search(term: string): Promise<SearchResult> {
    const [specialties, doctors] = await Promise.all([
      this.prisma.specialty.findMany({
        where: {
          OR: [{ name: { contains: term } }, { description: { contains: term } }],
        },
        orderBy: { name: 'asc' },
        take: RESULT_LIMIT,
      }),
      this.prisma.doctor.findMany({
        where: {
          OR: [{ name: { contains: term } }, { bio: { contains: term } }],
        },
        include: { specialty: { select: { name: true } } },
        orderBy: [{ rating: 'desc' }, { name: 'asc' }],
        take: RESULT_LIMIT,
      }),
    ]);

    return {
      specialties: specialties.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        icon: s.icon,
        avgDurationMin: s.avgDurationMin,
      })),
      doctors: doctors.map((d) => ({
        id: d.id,
        name: d.name,
        specialtyId: d.specialtyId,
        specialtyName: d.specialty.name,
        yearsExperience: d.yearsExperience,
        rating: d.rating,
        bio: d.bio,
      })),
    };
  }
}

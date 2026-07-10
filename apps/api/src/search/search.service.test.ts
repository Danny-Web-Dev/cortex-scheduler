import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SearchService } from './search.service';
import type { PrismaService } from '../prisma';

const buildService = (specialties: unknown[], doctors: unknown[]) => {
  const prisma = {
    specialty: { findMany: vi.fn().mockResolvedValue(specialties) },
    doctor: { findMany: vi.fn().mockResolvedValue(doctors) },
  } as unknown as PrismaService;
  return { service: new SearchService(prisma), prisma };
};

describe('SearchService.search', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps specialties and doctors into the response DTO with specialtyName', async () => {
    const { service } = buildService(
      [{ id: 's1', name: 'Cardiology', description: 'Heart', icon: null, avgDurationMin: 30 }],
      [
        {
          id: 'd1',
          name: 'Dr. Heart',
          specialtyId: 's1',
          specialty: { name: 'Cardiology' },
          yearsExperience: 10,
          rating: 4.8,
          bio: 'Cardiologist',
        },
      ],
    );

    const result = await service.search('card');

    expect(result.specialties).toHaveLength(1);
    expect(result.doctors[0]?.specialtyName).toBe('Cardiology');
    // Prisma relation object must not leak into the DTO.
    expect(result.doctors[0]).not.toHaveProperty('specialty');
  });

  it('queries both name and description/bio with the term', async () => {
    const { service, prisma } = buildService([], []);
    await service.search('neuro');

    expect(prisma.specialty.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ name: { contains: 'neuro' } }, { description: { contains: 'neuro' } }] },
      }),
    );
    expect(prisma.doctor.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ name: { contains: 'neuro' } }, { bio: { contains: 'neuro' } }] },
      }),
    );
  });
});

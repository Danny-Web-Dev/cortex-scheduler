import { Injectable } from '@nestjs/common';
import type { Specialty } from '@prisma/client';
import { PrismaService } from '../models';

const SEARCH_LIMIT = 10;

@Injectable()
export class SpecialtyRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(): Promise<Specialty[]> {
    return this.prisma.specialty.findMany({ orderBy: { name: 'asc' } });
  }

  findById(id: string): Promise<Specialty | null> {
    return this.prisma.specialty.findUnique({ where: { id } });
  }

  search(term: string): Promise<Specialty[]> {
    return this.prisma.specialty.findMany({
      where: { OR: [{ name: { contains: term } }, { description: { contains: term } }] },
      orderBy: { name: 'asc' },
      take: SEARCH_LIMIT,
    });
  }
}

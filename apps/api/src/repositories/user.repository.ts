import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService, type PrismaExecutor } from '../models';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  upsertByPhone(phone: string, tx?: PrismaExecutor): Promise<User> {
    return (tx ?? this.prisma).user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });
  }
}

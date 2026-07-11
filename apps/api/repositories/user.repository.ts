import { Injectable } from '@nestjs/common';
import type { User } from '@prisma/client';
import { PrismaService } from '../models';
import type { PrismaExecutor } from '../types';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string, tx?: PrismaExecutor): Promise<User | null> {
    return (tx ?? this.prisma).user.findUnique({ where: { phone } });
  }

  createWithPhone(phone: string, tx?: PrismaExecutor): Promise<User> {
    return (tx ?? this.prisma).user.create({ data: { phone } });
  }

  updateName(id: string, name: string, tx?: PrismaExecutor): Promise<User> {
    return (tx ?? this.prisma).user.update({ where: { id }, data: { name } });
  }
}

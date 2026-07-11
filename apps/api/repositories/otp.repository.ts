import { Injectable } from '@nestjs/common';
import type { OtpCode } from '../models';
import { PrismaService } from '../models';
import type { CreateOtp, PrismaExecutor } from '../types';

@Injectable()
export class OtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  async invalidateActive(phone: string, tx?: PrismaExecutor): Promise<void> {
    await (tx ?? this.prisma).otpCode.updateMany({
      where: { phone, consumedAt: null },
      data: { consumedAt: new Date() },
    });
  }

  async create(data: CreateOtp, tx?: PrismaExecutor): Promise<void> {
    await (tx ?? this.prisma).otpCode.create({ data });
  }

  findLatestUnconsumed(phone: string): Promise<OtpCode | null> {
    return this.prisma.otpCode.findFirst({
      where: { phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async setAttempts(id: string, attempts: number): Promise<void> {
    await this.prisma.otpCode.update({ where: { id }, data: { attempts } });
  }

  async consume(id: string, tx?: PrismaExecutor): Promise<void> {
    await (tx ?? this.prisma).otpCode.update({
      where: { id },
      data: { consumedAt: new Date() },
    });
  }
}

import { Injectable } from '@nestjs/common';
import type { RefreshToken, User } from '@/models';
import { PrismaService } from '@/models';
import type { CreateRefreshToken, PrismaExecutor } from '@/types';

@Injectable()
export class RefreshTokenRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: CreateRefreshToken, tx?: PrismaExecutor): Promise<RefreshToken> {
    return (tx ?? this.prisma).refreshToken.create({ data });
  }

  findByHashWithUser(
    tokenHash: string,
  ): Promise<(RefreshToken & { user: User }) | null> {
    return this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });
  }

  async revokeById(id: string, tx?: PrismaExecutor): Promise<void> {
    await (tx ?? this.prisma).refreshToken.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeFamily(familyId: string, tx?: PrismaExecutor): Promise<void> {
    await (tx ?? this.prisma).refreshToken.updateMany({
      where: { familyId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeByHash(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}

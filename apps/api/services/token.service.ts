import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/models';
import { ACCESS_TOKEN_TTL, ConfigService, MS_PER_DAY, REFRESH_TOKEN_TTL_DAYS } from '@/config';
import { RefreshTokenRepository } from '@/repositories';
import { UnauthorizedException, generateRefreshToken, sha256 } from '@/utils';
import type { IssuedRefreshToken, JwtPayload, RotatedTokens } from '@/types';

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly refreshTokens: RefreshTokenRepository,
  ) {}

  issueAccessToken(user: { id: string; phone: string }): string {
    const payload: JwtPayload = { sub: user.id, phone: user.phone };
    return this.jwt.sign(payload, {
      secret: this.config.jwtSecret,
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  async startFamily(userId: string): Promise<IssuedRefreshToken> {
    const { token, data } = this.buildRefreshToken(userId, randomUUID());
    const created = await this.refreshTokens.create(data);
    return { token, expiresAt: created.expiresAt };
  }

  async rotate(presentedToken: string): Promise<RotatedTokens> {
    const existing = await this.refreshTokens.findByHashWithUser(sha256(presentedToken));

    if (!existing) throw new UnauthorizedException('Invalid session');

    if (existing.revokedAt) {
      await this.refreshTokens.revokeFamily(existing.familyId);
      throw new UnauthorizedException('Session reuse detected');
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const rotated = await this.prisma.$transaction(async (tx) => {
      await this.refreshTokens.revokeById(existing.id, tx);
      const { token, data } = this.buildRefreshToken(existing.userId, existing.familyId);
      const created = await this.refreshTokens.create(data, tx);
      return { token, expiresAt: created.expiresAt };
    });

    const accessToken = this.issueAccessToken(existing.user);
    return { accessToken, refreshToken: rotated, user: existing.user };
  }

  async revoke(presentedToken: string): Promise<void> {
    await this.refreshTokens.revokeByHash(sha256(presentedToken));
  }

  private buildRefreshToken(userId: string, familyId: string) {
    const token = generateRefreshToken();
    const data = {
      userId,
      tokenHash: sha256(token),
      familyId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * MS_PER_DAY),
    };
    return { token, data };
  }
}

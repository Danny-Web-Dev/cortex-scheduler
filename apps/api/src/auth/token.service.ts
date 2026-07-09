import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma';
import { ConfigService } from '../config';
import { UnauthorizedException } from '../common/exceptions';
import {
  ACCESS_TOKEN_TTL,
  REFRESH_TOKEN_TTL_DAYS,
} from './auth.constants';
import { generateRefreshToken, sha256 } from './auth.crypto';
import type { JwtPayload } from './jwt.types';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type IssuedRefreshToken = {
  token: string;
  expiresAt: Date;
};

export type RotatedTokens = {
  accessToken: string;
  refreshToken: IssuedRefreshToken;
  user: { id: string; phone: string; name: string | null };
};

@Injectable()
export class TokenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  issueAccessToken(user: { id: string; phone: string }): string {
    const payload: JwtPayload = { sub: user.id, phone: user.phone };
    return this.jwt.sign(payload, {
      secret: this.config.jwtSecret,
      expiresIn: ACCESS_TOKEN_TTL,
    });
  }

  // Creates a brand-new token family (used at login).
  async startFamily(userId: string): Promise<IssuedRefreshToken> {
    return this.persistRefreshToken(userId, randomUUID());
  }

  // Rotate a presented refresh token. Reuse of an already-revoked token means the
  // token was stolen (the legitimate client already rotated it), so the whole
  // family is revoked and the caller is rejected.
  async rotate(presentedToken: string): Promise<RotatedTokens> {
    const tokenHash = sha256(presentedToken);
    const existing = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing) throw new UnauthorizedException('Invalid session');

    if (existing.revokedAt) {
      await this.prisma.refreshToken.updateMany({
        where: { familyId: existing.familyId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedException('Session reuse detected');
    }

    if (existing.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Session expired');
    }

    const rotated = await this.prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: existing.id },
        data: { revokedAt: new Date() },
      });
      const token = generateRefreshToken();
      const created = await tx.refreshToken.create({
        data: {
          userId: existing.userId,
          tokenHash: sha256(token),
          familyId: existing.familyId,
          expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * MS_PER_DAY),
        },
      });
      return { token, expiresAt: created.expiresAt };
    });

    const accessToken = this.issueAccessToken(existing.user);
    return { accessToken, refreshToken: rotated, user: existing.user };
  }

  async revoke(presentedToken: string): Promise<void> {
    const tokenHash = sha256(presentedToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async persistRefreshToken(userId: string, familyId: string): Promise<IssuedRefreshToken> {
    const token = generateRefreshToken();
    const created = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: sha256(token),
        familyId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * MS_PER_DAY),
      },
    });
    return { token, expiresAt: created.expiresAt };
  }
}

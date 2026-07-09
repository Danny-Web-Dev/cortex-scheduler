import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenService } from './token.service';
import { sha256 } from './auth.crypto';
import { UnauthorizedException } from '../common/exceptions';
import type { PrismaService } from '../prisma';
import type { ConfigService } from '../config';
import type { JwtService } from '@nestjs/jwt';

type RefreshRow = {
  id: string;
  userId: string;
  tokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt: Date | null;
  user: { id: string; phone: string; name: string | null };
};

const PRESENTED = 'presented-refresh-token';

const makeRow = (overrides: Partial<RefreshRow> = {}): RefreshRow => ({
  id: 'rt-1',
  userId: 'user-1',
  tokenHash: sha256(PRESENTED),
  familyId: 'fam-1',
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  user: { id: 'user-1', phone: '+972541234567', name: null },
  ...overrides,
});

const buildService = (row: RefreshRow | null) => {
  const updateMany = vi.fn().mockResolvedValue({ count: 1 });
  const update = vi.fn().mockResolvedValue(undefined);
  const create = vi
    .fn()
    .mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000) });

  const prisma = {
    refreshToken: {
      findUnique: vi.fn().mockResolvedValue(row),
      updateMany,
      update,
      create,
    },
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) =>
      cb({ refreshToken: { update, create } }),
    ),
  } as unknown as PrismaService;

  const jwt = { sign: vi.fn().mockReturnValue('new-access-token') } as unknown as JwtService;
  const config = { jwtSecret: 'x'.repeat(16) } as unknown as ConfigService;

  return { service: new TokenService(prisma, jwt, config), updateMany, update, create };
};

describe('TokenService.rotate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rotates a valid token: revokes the old and issues a new one', async () => {
    const { service, update, create } = buildService(makeRow());
    const result = await service.rotate(PRESENTED);

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'rt-1' }, data: expect.objectContaining({ revokedAt: expect.any(Date) }) }),
    );
    expect(create).toHaveBeenCalledOnce();
    expect(result.accessToken).toBe('new-access-token');
  });

  it('rejects an unknown token', async () => {
    const { service } = buildService(null);
    await expect(service.rotate(PRESENTED)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('detects reuse of a revoked token and revokes the whole family', async () => {
    const { service, updateMany } = buildService(makeRow({ revokedAt: new Date() }));
    await expect(service.rotate(PRESENTED)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { familyId: 'fam-1', revokedAt: null } }),
    );
  });

  it('rejects an expired token', async () => {
    const { service } = buildService(makeRow({ expiresAt: new Date(Date.now() - 1000) }));
    await expect(service.rotate(PRESENTED)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

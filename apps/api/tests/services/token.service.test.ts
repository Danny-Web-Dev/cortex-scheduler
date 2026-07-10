import { beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenService } from '../../services/token.service';
import { sha256, UnauthorizedException } from '../../utils';
import type { PrismaService } from '../../models';
import type { ConfigService } from '../../config';
import type { RefreshTokenRepository } from '../../repositories';
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
  const revokeFamily = vi.fn().mockResolvedValue(undefined);
  const revokeById = vi.fn().mockResolvedValue(undefined);
  const create = vi.fn().mockResolvedValue({ expiresAt: new Date(Date.now() + 60_000) });

  const prisma = {
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
  } as unknown as PrismaService;

  const refreshTokens = {
    findByHashWithUser: vi.fn().mockResolvedValue(row),
    revokeFamily,
    revokeById,
    create,
  } as unknown as RefreshTokenRepository;

  const jwt = { sign: vi.fn().mockReturnValue('new-access-token') } as unknown as JwtService;
  const config = { jwtSecret: 'x'.repeat(16) } as unknown as ConfigService;

  return { service: new TokenService(prisma, jwt, config, refreshTokens), revokeFamily, revokeById, create };
};

describe('TokenService.rotate', () => {
  beforeEach(() => vi.clearAllMocks());

  it('rotates a valid token: revokes the old and issues a new one', async () => {
    const { service, revokeById, create } = buildService(makeRow());
    const result = await service.rotate(PRESENTED);

    expect(revokeById).toHaveBeenCalledWith('rt-1', expect.anything());
    expect(create).toHaveBeenCalledOnce();
    expect(result.accessToken).toBe('new-access-token');
  });

  it('rejects an unknown token', async () => {
    const { service } = buildService(null);
    await expect(service.rotate(PRESENTED)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('detects reuse of a revoked token and revokes the whole family', async () => {
    const { service, revokeFamily } = buildService(makeRow({ revokedAt: new Date() }));
    await expect(service.rotate(PRESENTED)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(revokeFamily).toHaveBeenCalledWith('fam-1');
  });

  it('rejects an expired token', async () => {
    const { service } = buildService(makeRow({ expiresAt: new Date(Date.now() - 1000) }));
    await expect(service.rotate(PRESENTED)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});

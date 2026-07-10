import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../services/auth.service';
import {
  sha256,
  OTP_MAX_ATTEMPTS,
  OtpAttemptsExceededException,
  OtpExpiredException,
  OtpInvalidException,
} from '../../utils';
import type { PrismaService } from '../../models';
import type { ConfigService } from '../../config';
import type { OtpRepository, UserRepository } from '../../repositories';
import type { TokenService } from '../../services/token.service';

type OtpRow = {
  id: string;
  phone: string;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  consumedAt: Date | null;
  createdAt: Date;
};

const PHONE = '+972541234567';
const VALID_CODE = '123456';

const makeOtpRow = (overrides: Partial<OtpRow> = {}): OtpRow => ({
  id: 'otp-1',
  phone: PHONE,
  codeHash: sha256(VALID_CODE),
  attempts: 0,
  expiresAt: new Date(Date.now() + 60_000),
  consumedAt: null,
  createdAt: new Date(),
  ...overrides,
});

const buildService = (otpRow: OtpRow | null) => {
  const setAttempts = vi.fn().mockResolvedValue(undefined);
  const consume = vi.fn().mockResolvedValue(undefined);
  const upsertByPhone = vi.fn().mockResolvedValue({ id: 'user-1', phone: PHONE, name: null });

  const prisma = {
    // The transaction just runs the callback with a throwaway tx handle.
    $transaction: vi.fn(async (cb: (tx: unknown) => Promise<unknown>) => cb({})),
  } as unknown as PrismaService;

  const otps = {
    findLatestUnconsumed: vi.fn().mockResolvedValue(otpRow),
    setAttempts,
    consume,
    invalidateActive: vi.fn(),
    create: vi.fn(),
  } as unknown as OtpRepository;

  const users = { upsertByPhone } as unknown as UserRepository;
  const config = { isDevelopment: true } as unknown as ConfigService;
  const tokens = {
    issueAccessToken: vi.fn().mockReturnValue('access-token'),
    startFamily: vi.fn().mockResolvedValue({ token: 'refresh-token', expiresAt: new Date() }),
  } as unknown as TokenService;

  return { service: new AuthService(prisma, config, tokens, otps, users), setAttempts, upsertByPhone };
};

describe('AuthService.verifyOtp', () => {
  beforeEach(() => vi.clearAllMocks());

  it('issues tokens and upserts the user on a correct code', async () => {
    const { service, upsertByPhone } = buildService(makeOtpRow());
    const result = await service.verifyOtp({ phone: PHONE, code: VALID_CODE });

    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.user.phone).toBe(PHONE);
    expect(upsertByPhone).toHaveBeenCalledOnce();
  });

  it('rejects when no unconsumed code exists (reuse/consumed)', async () => {
    const { service } = buildService(null);
    await expect(service.verifyOtp({ phone: PHONE, code: VALID_CODE })).rejects.toBeInstanceOf(
      OtpInvalidException,
    );
  });

  it('rejects an expired code', async () => {
    const { service } = buildService(makeOtpRow({ expiresAt: new Date(Date.now() - 1000) }));
    await expect(service.verifyOtp({ phone: PHONE, code: VALID_CODE })).rejects.toBeInstanceOf(
      OtpExpiredException,
    );
  });

  it('increments attempts and rejects a wrong code', async () => {
    const { service, setAttempts } = buildService(makeOtpRow({ attempts: 1 }));
    await expect(service.verifyOtp({ phone: PHONE, code: '000000' })).rejects.toBeInstanceOf(
      OtpInvalidException,
    );
    expect(setAttempts).toHaveBeenCalledWith('otp-1', 2);
  });

  it('rejects once attempts are already at the max', async () => {
    const { service } = buildService(makeOtpRow({ attempts: OTP_MAX_ATTEMPTS }));
    await expect(service.verifyOtp({ phone: PHONE, code: VALID_CODE })).rejects.toBeInstanceOf(
      OtpAttemptsExceededException,
    );
  });

  it('converts a final wrong attempt into attempts-exceeded', async () => {
    const { service } = buildService(makeOtpRow({ attempts: OTP_MAX_ATTEMPTS - 1 }));
    await expect(service.verifyOtp({ phone: PHONE, code: '000000' })).rejects.toBeInstanceOf(
      OtpAttemptsExceededException,
    );
  });
});

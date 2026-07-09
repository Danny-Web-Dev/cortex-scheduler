import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';
import { sha256 } from './auth.crypto';
import { OTP_MAX_ATTEMPTS } from './auth.constants';
import {
  OtpAttemptsExceededException,
  OtpExpiredException,
  OtpInvalidException,
} from '../common/exceptions';
import type { PrismaService } from '../prisma';
import type { ConfigService } from '../config';
import type { TokenService } from './token.service';

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
  const otpUpdate = vi.fn().mockResolvedValue(undefined);
  const userUpsert = vi.fn().mockResolvedValue({ id: 'user-1', phone: PHONE, name: null });

  const prisma = {
    otpCode: {
      findFirst: vi.fn().mockResolvedValue(otpRow),
      update: otpUpdate,
    },
    user: { upsert: userUpsert },
    $transaction: vi.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: unknown) => Promise<unknown>)({
          otpCode: { update: otpUpdate },
          user: { upsert: userUpsert },
        });
      }
      return Promise.all(arg as Promise<unknown>[]);
    }),
  } as unknown as PrismaService;

  const config = { isDevelopment: true } as unknown as ConfigService;
  const tokens = {
    issueAccessToken: vi.fn().mockReturnValue('access-token'),
    startFamily: vi.fn().mockResolvedValue({ token: 'refresh-token', expiresAt: new Date() }),
  } as unknown as TokenService;

  return { service: new AuthService(prisma, config, tokens), prisma, otpUpdate, userUpsert };
};

describe('AuthService.verifyOtp', () => {
  beforeEach(() => vi.clearAllMocks());

  it('issues tokens and upserts the user on a correct code', async () => {
    const { service, userUpsert } = buildService(makeOtpRow());
    const result = await service.verifyOtp({ phone: PHONE, code: VALID_CODE });

    expect(result.tokens.accessToken).toBe('access-token');
    expect(result.tokens.user.phone).toBe(PHONE);
    expect(userUpsert).toHaveBeenCalledOnce();
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
    const { service, otpUpdate } = buildService(makeOtpRow({ attempts: 1 }));
    await expect(service.verifyOtp({ phone: PHONE, code: '000000' })).rejects.toBeInstanceOf(
      OtpInvalidException,
    );
    expect(otpUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { attempts: 2 } }),
    );
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

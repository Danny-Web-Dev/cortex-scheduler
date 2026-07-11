import { Injectable, Logger } from '@nestjs/common';
import type {
  AuthTokens,
  RequestOtpInput,
  RequestOtpResponse,
  VerifyOtpInput,
} from '@cortex/shared';
import { PrismaService } from '../models';
import { ConfigService } from '../config';
import { OtpRepository, UserRepository } from '../repositories';
import {
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MIN,
  OtpAttemptsExceededException,
  OtpExpiredException,
  OtpInvalidException,
  generateOtpCode,
  safeHashEqual,
  sha256,
} from '../utils';
import { TokenService, type IssuedRefreshToken } from './token.service';

const MS_PER_MIN = 60 * 1000;

export type LoginResult = {
  tokens: AuthTokens;
  refreshToken: IssuedRefreshToken;
};

export type VerifyResult = LoginResult & { isNewUser: boolean };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokens: TokenService,
    private readonly otps: OtpRepository,
    private readonly users: UserRepository,
  ) {}

  async requestOtp(input: RequestOtpInput): Promise<RequestOtpResponse> {
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * MS_PER_MIN);

    // Latest-code-wins: invalidate any outstanding codes for this phone.
    await this.prisma.$transaction(async (tx) => {
      await this.otps.invalidateActive(input.phone, tx);
      await this.otps.create({ phone: input.phone, codeHash: sha256(code), expiresAt }, tx);
    });

    // Never send SMS — always log; only surface the code in the response in dev.
    this.logger.log(`OTP for ${input.phone}: ${code}`);

    return {
      phone: input.phone,
      expiresAt: expiresAt.toISOString(),
      devCode: this.config.isDevelopment ? code : undefined,
    };
  }

  async verifyOtp(input: VerifyOtpInput): Promise<VerifyResult> {
    const record = await this.otps.findLatestUnconsumed(input.phone);

    if (!record) throw new OtpInvalidException();
    if (record.expiresAt.getTime() <= Date.now()) throw new OtpExpiredException();
    if (record.attempts >= OTP_MAX_ATTEMPTS) throw new OtpAttemptsExceededException();

    if (!safeHashEqual(record.codeHash, sha256(input.code))) {
      const attempts = record.attempts + 1;
      await this.otps.setAttempts(record.id, attempts);
      if (attempts >= OTP_MAX_ATTEMPTS) throw new OtpAttemptsExceededException();
      throw new OtpInvalidException();
    }

    const { user, isNewUser } = await this.prisma.$transaction(async (tx) => {
      await this.otps.consume(record.id, tx);
      const existing = await this.users.findByPhone(input.phone, tx);
      if (existing) return { user: existing, isNewUser: false };
      return { user: await this.users.createWithPhone(input.phone, tx), isNewUser: true };
    });

    const accessToken = this.tokens.issueAccessToken(user);
    const refreshToken = await this.tokens.startFamily(user.id);

    return {
      tokens: {
        accessToken,
        user: { id: user.id, phone: user.phone, name: user.name },
      },
      refreshToken,
      isNewUser,
    };
  }

  async refresh(presentedToken: string): Promise<LoginResult> {
    const rotated = await this.tokens.rotate(presentedToken);
    return {
      tokens: {
        accessToken: rotated.accessToken,
        user: { id: rotated.user.id, phone: rotated.user.phone, name: rotated.user.name },
      },
      refreshToken: rotated.refreshToken,
    };
  }

  async logout(presentedToken: string | undefined): Promise<void> {
    if (!presentedToken) return;
    await this.tokens.revoke(presentedToken);
  }
}

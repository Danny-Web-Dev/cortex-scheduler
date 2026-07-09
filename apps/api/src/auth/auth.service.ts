import { Injectable, Logger } from '@nestjs/common';
import type {
  AuthTokens,
  RequestOtpInput,
  RequestOtpResponse,
  VerifyOtpInput,
} from '@cortex/shared';
import { PrismaService } from '../prisma';
import { ConfigService } from '../config';
import {
  OtpAttemptsExceededException,
  OtpExpiredException,
  OtpInvalidException,
} from '../common/exceptions';
import { OTP_MAX_ATTEMPTS, OTP_TTL_MIN } from './auth.constants';
import { generateOtpCode, safeHashEqual, sha256 } from './auth.crypto';
import { TokenService, type IssuedRefreshToken } from './token.service';

const MS_PER_MIN = 60 * 1000;

export type LoginResult = {
  tokens: AuthTokens;
  refreshToken: IssuedRefreshToken;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly tokens: TokenService,
  ) {}

  async requestOtp(input: RequestOtpInput): Promise<RequestOtpResponse> {
    const code = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * MS_PER_MIN);

    // Latest-code-wins: invalidate any outstanding codes for this phone.
    await this.prisma.$transaction([
      this.prisma.otpCode.updateMany({
        where: { phone: input.phone, consumedAt: null },
        data: { consumedAt: new Date() },
      }),
      this.prisma.otpCode.create({
        data: { phone: input.phone, codeHash: sha256(code), expiresAt },
      }),
    ]);

    // Never send SMS — always log; only surface the code in the response in dev.
    this.logger.log(`OTP for ${input.phone}: ${code}`);

    return {
      phone: input.phone,
      expiresAt: expiresAt.toISOString(),
      devCode: this.config.isDevelopment ? code : undefined,
    };
  }

  async verifyOtp(input: VerifyOtpInput): Promise<LoginResult> {
    const record = await this.prisma.otpCode.findFirst({
      where: { phone: input.phone, consumedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) throw new OtpInvalidException();
    if (record.expiresAt.getTime() <= Date.now()) throw new OtpExpiredException();
    if (record.attempts >= OTP_MAX_ATTEMPTS) throw new OtpAttemptsExceededException();

    if (!safeHashEqual(record.codeHash, sha256(input.code))) {
      const attempts = record.attempts + 1;
      await this.prisma.otpCode.update({
        where: { id: record.id },
        data: { attempts },
      });
      if (attempts >= OTP_MAX_ATTEMPTS) throw new OtpAttemptsExceededException();
      throw new OtpInvalidException();
    }

    const user = await this.prisma.$transaction(async (tx) => {
      await tx.otpCode.update({
        where: { id: record.id },
        data: { consumedAt: new Date() },
      });
      return tx.user.upsert({
        where: { phone: input.phone },
        update: {},
        create: { phone: input.phone },
      });
    });

    const accessToken = this.tokens.issueAccessToken(user);
    const refreshToken = await this.tokens.startFamily(user.id);

    return {
      tokens: {
        accessToken,
        user: { id: user.id, phone: user.phone, name: user.name },
      },
      refreshToken,
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

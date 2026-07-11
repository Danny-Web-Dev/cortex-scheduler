import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { AuthTokens, RequestOtpResponse, VerifyOtpResponse } from '@cortex/shared';
import { ConfigService } from '../config';
import { AuthService } from '../services';
import { RequestOtpDto, VerifyOtpDto } from '../dtos';
import {
  OTP_THROTTLE_LIMIT,
  OTP_THROTTLE_TTL_MS,
  REFRESH_COOKIE_NAME,
  UnauthorizedException,
  clearRefreshCookie,
  setRefreshCookie,
} from '../utils';

const otpThrottle = { default: { limit: OTP_THROTTLE_LIMIT, ttl: OTP_THROTTLE_TTL_MS } };

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('otp/request')
  @Throttle(otpThrottle)
  @HttpCode(HttpStatus.OK)
  async requestOtp(@Body() dto: RequestOtpDto): Promise<RequestOtpResponse> {
    return this.auth.requestOtp(dto);
  }

  @Post('otp/verify')
  @Throttle(otpThrottle)
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() dto: VerifyOtpDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<VerifyOtpResponse> {
    const result = await this.auth.verifyOtp(dto);
    setRefreshCookie(res, result.refreshToken.token, !this.config.isDevelopment);
    return { ...result.tokens, isNewUser: result.isNewUser };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokens> {
    const presented = this.readRefreshCookie(req);
    const result = await this.auth.refresh(presented);
    setRefreshCookie(res, result.refreshToken.token, !this.config.isDevelopment);
    return result.tokens;
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.auth.logout(this.readRefreshCookieOptional(req));
    clearRefreshCookie(res, !this.config.isDevelopment);
  }

  private readRefreshCookie(req: Request): string {
    const value = this.readRefreshCookieOptional(req);
    if (!value) throw new UnauthorizedException('Invalid session');
    return value;
  }

  private readRefreshCookieOptional(req: Request): string | undefined {
    const cookies = (req as Request & { cookies?: Record<string, string> }).cookies;
    return cookies?.[REFRESH_COOKIE_NAME];
  }
}

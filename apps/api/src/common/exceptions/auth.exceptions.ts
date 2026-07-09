import { HttpStatus } from '@nestjs/common';
import type { ErrorCode } from '@cortex/shared';
import { DomainException } from './domain.exception';

export class OtpInvalidException extends DomainException {
  readonly code: ErrorCode = 'OTP_INVALID';
  readonly httpStatus = HttpStatus.BAD_REQUEST;
  constructor(message = 'Invalid verification code') {
    super(message);
  }
}

export class OtpExpiredException extends DomainException {
  readonly code: ErrorCode = 'OTP_EXPIRED';
  readonly httpStatus = HttpStatus.GONE;
  constructor(message = 'Verification code has expired') {
    super(message);
  }
}

export class OtpAttemptsExceededException extends DomainException {
  readonly code: ErrorCode = 'OTP_ATTEMPTS_EXCEEDED';
  readonly httpStatus = HttpStatus.TOO_MANY_REQUESTS;
  constructor(message = 'Too many incorrect attempts. Request a new code.') {
    super(message);
  }
}

export class UnauthorizedException extends DomainException {
  readonly code: ErrorCode = 'UNAUTHORIZED';
  readonly httpStatus = HttpStatus.UNAUTHORIZED;
  constructor(message = 'Authentication required') {
    super(message);
  }
}

export class ForbiddenException extends DomainException {
  readonly code: ErrorCode = 'FORBIDDEN';
  readonly httpStatus = HttpStatus.FORBIDDEN;
  constructor(message = 'Not allowed') {
    super(message);
  }
}

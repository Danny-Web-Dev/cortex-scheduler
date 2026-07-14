import { HttpStatus } from '@nestjs/common';
import type { ErrorCode } from '@cortex/shared';
import { DomainException } from '@/utils';

export class NotFoundException extends DomainException {
  readonly code: ErrorCode = 'NOT_FOUND';
  readonly httpStatus = HttpStatus.NOT_FOUND;
  constructor(message = 'Resource not found') {
    super(message);
  }
}

export class SlotTakenException extends DomainException {
  readonly code: ErrorCode = 'SLOT_TAKEN';
  readonly httpStatus = HttpStatus.CONFLICT;
  constructor(message = 'That slot was just taken') {
    super(message);
  }
}

export class HoldExpiredException extends DomainException {
  readonly code: ErrorCode = 'HOLD_EXPIRED';
  readonly httpStatus = HttpStatus.GONE;
  constructor(message = 'Your hold on this slot has expired') {
    super(message);
  }
}

export class ValidationException extends DomainException {
  readonly code: ErrorCode = 'VALIDATION';
  readonly httpStatus = HttpStatus.BAD_REQUEST;
  constructor(message = 'Invalid request') {
    super(message);
  }
}

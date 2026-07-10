import {
  Catch,
  HttpException,
  HttpStatus,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { ZodValidationException } from 'nestjs-zod';
import type { Response } from 'express';
import type { ApiErrorBody, ErrorCode } from '@cortex/shared';
import { DomainException } from '../utils';

type Resolved = { status: number; code: ErrorCode; message: string };

// One place that turns every thrown thing into { error: { code, message } }.
// Services throw DomainExceptions; framework throws HttpExceptions; anything
// unrecognized is a 500 whose real cause is logged but never leaked.
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const resolved = this.resolve(exception);

    if (resolved.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    const body: ApiErrorBody = { error: { code: resolved.code, message: resolved.message } };
    response.status(resolved.status).json(body);
  }

  private resolve(exception: unknown): Resolved {
    if (exception instanceof DomainException) {
      return { status: exception.httpStatus, code: exception.code, message: exception.message };
    }

    if (exception instanceof ThrottlerException) {
      return {
        status: HttpStatus.TOO_MANY_REQUESTS,
        code: 'RATE_LIMITED',
        message: 'Too many requests. Please slow down.',
      };
    }

    if (exception instanceof ZodValidationException) {
      return {
        status: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION',
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      return {
        status: exception.getStatus(),
        code: this.codeForStatus(exception.getStatus()),
        message: exception.message,
      };
    }

    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL',
      message: 'Something went wrong',
    };
  }

  private codeForStatus(status: number): ErrorCode {
    if (status === HttpStatus.UNAUTHORIZED) return 'UNAUTHORIZED';
    if (status === HttpStatus.FORBIDDEN) return 'FORBIDDEN';
    if (status === HttpStatus.NOT_FOUND) return 'NOT_FOUND';
    if (status === HttpStatus.CONFLICT) return 'SLOT_TAKEN';
    if (status === HttpStatus.TOO_MANY_REQUESTS) return 'RATE_LIMITED';
    if (status === HttpStatus.BAD_REQUEST) return 'VALIDATION';
    return 'INTERNAL';
  }
}

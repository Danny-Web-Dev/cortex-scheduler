import type { ErrorCode } from '@cortex/shared';

// A typed error the UI can switch on by `code` — never by parsing messages.
export class ApiError extends Error {
  readonly code: ErrorCode;
  readonly status: number;

  constructor(code: ErrorCode, message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
  }
}

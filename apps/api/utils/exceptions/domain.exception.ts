import type { ErrorCode } from '@cortex/shared';

// Base class for all domain-level failures. Services throw these; the global
// filter maps them to HTTP. HTTP status is metadata the domain carries so the
// filter stays a pure translator — services never speak HTTP.
export abstract class DomainException extends Error {
  abstract readonly code: ErrorCode;
  abstract readonly httpStatus: number;

  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

import type { ErrorCode } from '@cortex/shared';

export type ResolvedError = { status: number; code: ErrorCode; message: string };

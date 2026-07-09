import { createZodDto } from 'nestjs-zod';
import { RequestOtpSchema, VerifyOtpSchema } from '@cortex/shared';

export class RequestOtpDto extends createZodDto(RequestOtpSchema) {}
export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) {}

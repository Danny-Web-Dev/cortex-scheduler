import { createZodDto } from 'nestjs-zod';
import { SlotsQuerySchema } from '@cortex/shared';

export class SlotsQueryDto extends createZodDto(SlotsQuerySchema) {}

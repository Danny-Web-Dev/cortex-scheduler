import { createZodDto } from 'nestjs-zod';
import { UpdateProfileSchema } from '@cortex/shared';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}

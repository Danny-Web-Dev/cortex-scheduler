import { createZodDto } from 'nestjs-zod';
import { SearchQuerySchema } from '@cortex/shared';

export class SearchQueryDto extends createZodDto(SearchQuerySchema) {}

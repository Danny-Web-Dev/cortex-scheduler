import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { SearchResult } from '@cortex/shared';
import { SearchService } from './search.service';
import { SearchQueryDto } from './search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly search: SearchService) {}

  @Get()
  async run(@Query() query: SearchQueryDto): Promise<SearchResult> {
    return this.search.search(query.q);
  }
}

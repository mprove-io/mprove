import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { QueryInfoQuery } from '#common/interfaces/backend/query-info/query-info-query';

export class QueryInfoChart {
  @IsString()
  title: string;

  @IsString()
  chartId: string;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => QueryInfoQuery)
  query: QueryInfoQuery;
}

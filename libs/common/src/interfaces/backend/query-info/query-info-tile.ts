import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { QueryInfoQuery } from '#common/interfaces/to-backend/query-info/query-info-query';

export class QueryInfoTile {
  @IsString()
  title: string;

  @ValidateNested()
  @Type(() => QueryInfoQuery)
  query: QueryInfoQuery;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { QueryInfoRow } from '#common/interfaces/backend/query-info/query-info-row';

export class QueryInfoReport {
  @IsString()
  title: string;

  @IsString()
  reportId: string;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => QueryInfoRow)
  rows: QueryInfoRow[];
}

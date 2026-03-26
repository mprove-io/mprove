import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Query } from '#common/interfaces/blockml/query';

export class RunChart {
  @IsString()
  title: string;

  @IsString()
  chartId: string;

  @IsString()
  url: string;

  @ValidateNested()
  @Type(() => Query)
  query: Query;
}

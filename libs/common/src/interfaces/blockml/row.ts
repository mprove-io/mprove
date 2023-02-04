import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Mconfig } from './mconfig';
import { Query } from './query';

export class Row {
  @IsString()
  rowId: string;

  @IsString()
  metricId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => Mconfig)
  mconfig?: Mconfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => Query)
  query?: Query;

  params: any[];

  formula: string;

  records: any[];
}

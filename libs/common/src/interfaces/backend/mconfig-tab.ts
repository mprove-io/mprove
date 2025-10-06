import { CompiledQuery } from '@malloydata/malloy/dist/model';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { IsTimezone } from '~common/functions/is-timezone';
import { Filter } from '../blockml/filter';
import { MconfigChart } from '../blockml/mconfig-chart';
import { Sorting } from '../blockml/sorting';
import { StorePart } from '../blockml/store-part';

export class MconfigTab {
  @IsOptional()
  @IsBoolean()
  dateRangeIncludesRightSide: boolean;

  @IsOptional()
  @ValidateNested()
  @Type(() => StorePart)
  storePart: StorePart;

  @IsString()
  modelLabel: string;

  @IsOptional()
  @IsString()
  modelFilePath: string;

  @IsOptional()
  @IsString()
  malloyQueryStable: string;

  @IsOptional()
  @IsString()
  malloyQueryExtra: string;

  compiledQuery: CompiledQuery;

  @IsString({ each: true })
  select: string[];

  @ValidateNested()
  @Type(() => Sorting)
  sortings: Sorting[];

  @IsOptional()
  @IsString()
  sorts: string;

  @IsTimezone()
  timezone: string;

  @IsNumber()
  limit: number;

  @ValidateNested()
  @Type(() => Filter)
  filters: Filter[];

  @ValidateNested()
  @Type(() => MconfigChart)
  chart: MconfigChart;
}

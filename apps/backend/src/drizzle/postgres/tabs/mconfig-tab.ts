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
import { Filter } from '~common/interfaces/blockml/filter';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { Sorting } from '~common/interfaces/blockml/sorting';
import { StorePart } from '~common/interfaces/blockml/store-part';
import { MconfigEnt } from '../schema/mconfigs';

export interface MconfigTab extends Omit<MconfigEnt, 'st' | 'lt'> {
  st: MconfigSt;
  lt: MconfigLt;
}

export class MconfigSt {
  emptyData?: number;
}

export class MconfigLt {
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

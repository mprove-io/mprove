import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { IsTimezone } from '~common/functions/is-timezone';
import { Filter } from './filter';
import { JoinAggregation } from './join-aggregation';
import { MconfigChart } from './mconfig-chart';
import { Sorting } from './sorting';

export class Mconfig {
  @IsString()
  structId: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsString()
  modelId: string;

  @IsBoolean()
  isStoreModel: boolean;

  @IsString()
  modelLabel: string;

  @IsString({ each: true })
  select: string[];

  @ValidateNested()
  @Type(() => JoinAggregation)
  joinAggregations: JoinAggregation[];

  @IsString({ each: true })
  unsafeSelect: string[];

  @IsString({ each: true })
  warnSelect: string[];

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

  @IsBoolean()
  temp: boolean;

  @IsInt()
  serverTs: number;
}

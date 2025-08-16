import { CompiledQuery } from '@malloydata/malloy/dist/model';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { IsTimezone } from '~common/functions/is-timezone';
import { Filter } from './filter';
import { MconfigChart } from './mconfig-chart';
import { Sorting } from './sorting';
import { StorePart } from './store-part';

export class Mconfig {
  @IsString()
  structId: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsString()
  modelId: string;

  @IsEnum(enums.ModelTypeEnum)
  modelType: enums.ModelTypeEnum;

  // @IsBoolean()
  // isStoreModel: boolean;

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
  malloyQuery: string;

  compiledQuery: CompiledQuery;

  @IsString({ each: true })
  select: string[];

  // @ValidateNested()
  // @Type(() => JoinAggregation)
  // joinAggregations: JoinAggregation[];

  // @IsString({ each: true })
  // unsafeSelect: string[];

  // @IsString({ each: true })
  // warnSelect: string[];

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

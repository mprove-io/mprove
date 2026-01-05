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
import { MconfigParentTypeEnum } from '~common/enums/mconfig-parent-type.enum';
import { ModelTypeEnum } from '~common/enums/model-type.enum';
import { IsTimezone } from '~common/functions/is-timezone';
import { Filter } from './filter';
import { MconfigChart } from './mconfig-chart';
import { Sorting } from './sorting';
import { StorePart } from './store-part';
// import { CompiledQuery } from '@malloydata/malloy';
// import { CompiledQuery } from '@malloydata/malloy/dist/model';
// import { CompiledQuery } from '@malloydata/malloy/dist/model/malloy_types';

export class Mconfig {
  @IsString()
  structId: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsString()
  modelId: string;

  @IsEnum(ModelTypeEnum)
  modelType: ModelTypeEnum;

  @IsEnum(MconfigParentTypeEnum)
  parentType: MconfigParentTypeEnum;

  @IsOptional()
  @IsString()
  parentId: string;

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

  compiledQuery: any; // CompiledQuery;

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

  @IsInt()
  serverTs: number;
}

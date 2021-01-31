import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsString,
  ValidateNested
} from 'class-validator';
import { Chart } from './chart';
import { Filter } from './filter';
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

  @IsString({ each: true })
  select: string[];

  @ValidateNested()
  @Type(() => Sorting)
  sortings: Sorting[];

  @IsString()
  sorts: string;

  @IsString()
  timezone: string;

  @IsNumber()
  limit: number;

  @ValidateNested()
  @Type(() => Filter)
  filters: Filter[];

  @ValidateNested()
  @Type(() => Chart)
  charts: Chart[];

  @IsBoolean()
  temp: boolean;

  @IsInt()
  serverTs: number;
}

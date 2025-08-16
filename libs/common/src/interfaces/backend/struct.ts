import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { IsTimezone } from '~common/functions/is-timezone';
import { Preset } from '../_index';
import { BmlError } from '../blockml/bml-error';
import { ModelMetric } from '../blockml/model-metric';

export class Struct {
  @IsString()
  projectId: string;

  @IsString()
  mproveDirValue: string;

  @IsString()
  structId: string;

  @IsEnum(enums.ProjectWeekStartEnum)
  weekStart: enums.ProjectWeekStartEnum;

  @IsBoolean()
  allowTimezones: boolean;

  @IsTimezone()
  defaultTimezone: string;

  @IsString()
  formatNumber: string;

  @IsString()
  currencyPrefix: string;

  @IsString()
  currencySuffix: string;

  @IsString()
  thousandsSeparator: string;

  @IsBoolean()
  caseSensitiveStringFilters: boolean;

  @IsBoolean()
  simplifySafeAggregates: boolean;

  @ValidateNested()
  @Type(() => BmlError)
  errors: BmlError[];

  @ValidateNested()
  @Type(() => ModelMetric)
  metrics: ModelMetric[];

  @ValidateNested()
  @Type(() => Preset)
  presets: Preset[];

  @IsInt()
  serverTs: number;
}

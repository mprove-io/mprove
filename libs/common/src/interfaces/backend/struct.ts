import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  ValidateNested
} from 'class-validator';
import { ProjectWeekStartEnum } from '~common/enums/project-week-start.enum';
import { IsTimezone } from '~common/functions/is-timezone';
import { BmlError } from '../blockml/bml-error';
import { ModelMetric } from '../blockml/model-metric';
import { Preset } from '../blockml/preset';

export class Struct {
  @IsString()
  projectId: string;

  @IsString()
  mproveDirValue: string;

  @IsString()
  structId: string;

  @IsEnum(ProjectWeekStartEnum)
  weekStart: ProjectWeekStartEnum;

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

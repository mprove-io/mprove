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
import { BmlError } from '../blockml/bml-error';
import { UdfsDict } from '../blockml/udfs-dict';
import { View } from '../blockml/view';

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

  @IsBoolean()
  caseSensitiveStringFilters: boolean;

  @IsBoolean()
  simplifySafeAggregates: boolean;

  @ValidateNested()
  @Type(() => BmlError)
  errors: BmlError[];

  @ValidateNested()
  @Type(() => View)
  views: View[];

  @ValidateNested()
  @Type(() => UdfsDict)
  udfsDict: UdfsDict;

  @IsInt()
  serverTs: number;
}

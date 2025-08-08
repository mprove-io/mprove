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
import { Column } from './column';
import { Fraction } from './fraction';
import { MconfigChart } from './mconfig-chart';
import { ReportField } from './report-field';
import { Row } from './row';

export class Report {
  @IsString()
  projectId: string;

  @IsString()
  structId: string;

  @IsString()
  reportId: string;

  @IsBoolean()
  draft: boolean;

  @IsString()
  creatorId: string;

  @IsString()
  filePath: string;

  @ValidateNested()
  @Type(() => ReportField)
  fields: ReportField[];

  @IsString({ each: true })
  accessRoles: string[];

  @IsString()
  title: string;

  @IsTimezone()
  timezone: string;

  @IsEnum(enums.TimeSpecEnum)
  timeSpec: enums.TimeSpecEnum;

  @ValidateNested()
  @Type(() => Fraction)
  timeRangeFraction: Fraction;

  // @IsOptional()
  // @IsNumber()
  // rangeOpen: number;

  // @IsOptional()
  // @IsNumber()
  // rangeClose: number;

  @IsOptional()
  @IsNumber()
  rangeStart: number;

  @IsOptional()
  @IsNumber()
  rangeEnd: number;

  @ValidateNested()
  @Type(() => Column)
  columns: Column[];

  @ValidateNested()
  @Type(() => Row)
  rows: Row[];

  @IsBoolean()
  isTimeColumnsLimitExceeded: boolean;

  @IsInt()
  timeColumnsLimit: number;

  @IsInt()
  timeColumnsLength: number;

  @IsInt()
  draftCreatedTs: number;

  @ValidateNested()
  @Type(() => MconfigChart)
  chart: MconfigChart;

  @IsInt()
  serverTs: number;
}

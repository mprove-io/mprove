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
import { Column } from './column';
import { Fraction } from './fraction';
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
  accessUsers: string[];

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

  @IsInt()
  serverTs: number;
}

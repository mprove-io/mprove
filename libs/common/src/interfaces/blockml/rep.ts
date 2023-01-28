import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Column } from './column';
import { Fraction } from './fraction';
import { Row } from './row';

export class Rep {
  @IsString()
  projectId: string;

  @IsString()
  structId: string;

  @IsString()
  repId: string;

  @IsBoolean()
  draft: boolean;

  @IsString()
  creatorId: string;

  @IsString()
  filePath: string;

  @IsString()
  title: string;

  @IsString()
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
  serverTs: number;
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsString,
  ValidateNested
} from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Fraction } from './fraction';
import { Row } from './row';

export class Rep {
  @IsString()
  structId: string;

  @IsString()
  repId: string;

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

  @IsInt({ each: true })
  columns: number[];

  @ValidateNested()
  @Type(() => Row)
  rows: Row[];

  @IsBoolean()
  isTimeColumnsLimitReached: boolean;

  @IsInt()
  timeColumnsLimit: number;

  @IsInt()
  timeColumnsLength: number;

  @IsInt()
  serverTs: number;
}

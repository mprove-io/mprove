import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
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

  @IsString()
  timeRange: string;

  @ValidateNested()
  @Type(() => Row)
  rows: Row[];

  @IsInt()
  serverTs: number;
}

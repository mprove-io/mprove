import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '~common/barrels/enums';
import { Row } from './row';

export class Rep {
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
}

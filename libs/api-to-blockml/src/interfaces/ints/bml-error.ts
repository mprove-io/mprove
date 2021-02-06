import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';

export class BmlError {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  lines: common.DiskFileLine[];
}

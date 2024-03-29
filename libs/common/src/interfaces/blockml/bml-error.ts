import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { DiskFileLine } from '~common/interfaces/disk/_index';

export class BmlError {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => DiskFileLine)
  lines: DiskFileLine[];
}

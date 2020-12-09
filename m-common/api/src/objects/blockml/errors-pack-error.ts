import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { DiskFileLine } from '../disk/disk-file-line';

export class ErrorsPackError {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => DiskFileLine)
  lines: DiskFileLine[];
}

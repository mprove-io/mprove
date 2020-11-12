import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { DiskFileLine } from '../disk/disk-file-line';

export class SwError {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  structId: string;

  @IsString()
  errorId: string;

  @IsString()
  type: string;

  @IsString()
  message: string;

  @ValidateNested()
  @Type(() => DiskFileLine)
  lines: DiskFileLine[];

  @IsInt()
  serverTs: number;
}

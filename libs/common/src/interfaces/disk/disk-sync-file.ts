import { IsNumber, IsOptional, IsString } from 'class-validator';
import { FileStatusEnum } from '~common/enums/file-status.enum';

export class DiskSyncFile {
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  status: FileStatusEnum;

  @IsOptional()
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  modifiedTime: number;
}

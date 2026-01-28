import { IsOptional, IsString } from 'class-validator';
import { FileStatusEnum } from '#common/enums/file-status.enum';

export class DiskFileChange {
  @IsString()
  fileName: string;

  @IsString()
  fileId: string;

  @IsString()
  parentPath: string;

  @IsString()
  status: FileStatusEnum;

  @IsOptional()
  @IsString()
  content?: string;
}

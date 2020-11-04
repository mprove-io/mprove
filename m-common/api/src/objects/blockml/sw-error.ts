import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../objects/_index';

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
  @Type(() => apiObjects.DiskFileLine)
  lines: apiObjects.DiskFileLine[];

  @IsInt()
  serverTs: number;
}

import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { api } from '../barrels/api';
import { FilePathContent } from './file-path-content';

export class File2 {
  @IsEnum(api.FileExtensionEnum)
  ext: api.FileExtensionEnum;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => FilePathContent)
  pathContents: FilePathContent[];
}

import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { api } from '../../barrels/api';
import { File2PathContent } from './file-2-path-content';

export class File2 {
  @IsEnum(api.FileExtensionEnum)
  ext: api.FileExtensionEnum;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => File2PathContent)
  pathContents: File2PathContent[];
}

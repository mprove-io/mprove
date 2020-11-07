import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { api } from '../barrels/api';
import { PathContent } from './path-content';

export class File2 {
  @IsEnum(api.FileExtensionEnum)
  ext: api.FileExtensionEnum;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => PathContent)
  filePaths: PathContent[];
}

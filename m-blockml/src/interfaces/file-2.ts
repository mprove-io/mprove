import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { enums } from '../barrels/enums';
import { PathContent } from './path-content';

export class File2 {
  @IsEnum(enums.FileExtensionEnum)
  ext: enums.FileExtensionEnum;

  @IsString()
  name: string;

  @ValidateNested()
  @Type(() => PathContent)
  filePaths: PathContent[];
}

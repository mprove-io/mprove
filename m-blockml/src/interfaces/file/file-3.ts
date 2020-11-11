import { IsEnum, IsString } from 'class-validator';
import { api } from '../../barrels/api';

export class File3 {
  @IsEnum(api.FileExtensionEnum)
  ext: api.FileExtensionEnum;

  @IsString()
  name: string;

  @IsString()
  path: string;

  @IsString()
  content: string;
}

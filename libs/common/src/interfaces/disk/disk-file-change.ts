import { IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class DiskFileChange {
  @IsString()
  fileName: string;

  @IsString()
  fileId: string;

  @IsString()
  parentPath: string;

  @IsString()
  status: enums.FileStatusEnum;
}

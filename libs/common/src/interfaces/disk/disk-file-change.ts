import { IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class DiskFileChange {
  @IsString()
  path: string;

  @IsString()
  status: enums.FileStatusEnum;
}

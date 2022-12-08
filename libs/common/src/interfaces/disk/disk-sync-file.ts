import { IsString } from 'class-validator';
import { enums } from '~common/barrels/enums';

export class DiskSyncFile {
  @IsString()
  path: string;

  @IsString()
  status: enums.FileStatusEnum;

  @IsString()
  content: string;
}

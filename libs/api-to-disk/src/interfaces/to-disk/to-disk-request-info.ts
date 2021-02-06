import { IsEnum, IsString } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';

export class ToDiskRequestInfo implements common.RequestInfo {
  @IsEnum(enums.ToDiskRequestInfoNameEnum)
  name: enums.ToDiskRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

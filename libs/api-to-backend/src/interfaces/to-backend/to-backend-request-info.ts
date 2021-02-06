import { IsEnum, IsString } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { enums } from '~api-to-backend/barrels/enums';

export class ToBackendRequestInfo implements common.RequestInfo {
  @IsEnum(enums.ToBackendRequestInfoNameEnum)
  name: enums.ToBackendRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

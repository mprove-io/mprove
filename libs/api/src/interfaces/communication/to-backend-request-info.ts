import { IsEnum, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { RequestInfo } from './request-info';

export class ToBackendRequestInfo implements RequestInfo {
  @IsEnum(enums.ToBackendRequestInfoNameEnum)
  name: enums.ToBackendRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

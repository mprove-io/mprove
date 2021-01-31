import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import { RequestInfo } from './request-info';

export class ToBackendRequestInfo implements RequestInfo {
  @IsEnum(apiEnums.ToBackendRequestInfoNameEnum)
  name: apiEnums.ToBackendRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

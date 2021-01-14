import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ToBackendRequestInfo {
  @IsEnum(apiEnums.ToBackendRequestInfoNameEnum)
  name: apiEnums.ToBackendRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

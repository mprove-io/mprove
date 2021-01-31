import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import { RequestInfo } from './request-info';

export class ToBlockmlWorkerRequestInfo implements RequestInfo {
  @IsEnum(apiEnums.ToBlockmlWorkerRequestInfoNameEnum)
  name: apiEnums.ToBlockmlWorkerRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

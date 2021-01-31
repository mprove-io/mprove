import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '~/enums/_index';
import { RequestInfo } from './request-info';

export class ToBlockmlRequestInfo implements RequestInfo {
  @IsEnum(apiEnums.ToBlockmlRequestInfoNameEnum)
  name: apiEnums.ToBlockmlRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

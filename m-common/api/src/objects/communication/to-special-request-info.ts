import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';
import { RequestInfo } from './request-info';

export class ToSpecialRequestInfo implements RequestInfo {
  @IsEnum(apiEnums.ToSpecialRequestInfoNameEnum)
  name: apiEnums.ToSpecialRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

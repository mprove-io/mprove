import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ToBlockmlRequestInfo {
  @IsEnum(apiEnums.ToBlockmlRequestInfoNameEnum)
  name: apiEnums.ToBlockmlRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

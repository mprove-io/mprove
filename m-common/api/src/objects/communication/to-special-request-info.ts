import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ToSpecialRequestInfo {
  @IsEnum(apiEnums.ToSpecialRequestInfoNameEnum)
  name: apiEnums.ToSpecialRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

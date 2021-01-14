import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class SpecialRequestInfo {
  @IsEnum(apiEnums.ToSpecialRequestInfoNameEnum)
  name: apiEnums.ToSpecialRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

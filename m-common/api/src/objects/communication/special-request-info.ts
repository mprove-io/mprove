import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class SpecialRequestInfo {
  @IsEnum(apiEnums.SpecialRequestInfoNameEnum)
  name: apiEnums.SpecialRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

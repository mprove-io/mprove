import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ToDiskRequestInfo {
  @IsEnum(apiEnums.ToDiskRequestInfoNameEnum)
  name: apiEnums.ToDiskRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

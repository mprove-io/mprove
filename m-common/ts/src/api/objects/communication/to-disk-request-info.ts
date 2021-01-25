import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '~/api/enums/_index';
import { RequestInfo } from './request-info';

export class ToDiskRequestInfo implements RequestInfo {
  @IsEnum(apiEnums.ToDiskRequestInfoNameEnum)
  name: apiEnums.ToDiskRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

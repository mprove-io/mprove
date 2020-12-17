import { IsEnum, IsString } from 'class-validator';
import * as apiEnums from '../../enums/_index';

export class ToBlockmlWorkerRequestInfo {
  @IsEnum(apiEnums.ToBlockmlWorkerRequestInfoNameEnum)
  name: apiEnums.ToBlockmlWorkerRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

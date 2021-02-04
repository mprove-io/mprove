import { IsEnum, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { RequestInfo } from './request-info';

export class ToBlockmlRequestInfo implements RequestInfo {
  @IsEnum(enums.ToBlockmlRequestInfoNameEnum)
  name: enums.ToBlockmlRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

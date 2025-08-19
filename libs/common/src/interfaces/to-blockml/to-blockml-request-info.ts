import { IsEnum, IsString } from 'class-validator';
import { ToBlockmlRequestInfoNameEnum } from '~common/enums/to/to-blockml-request-info-name.enum';
import { RequestInfo } from '~common/interfaces/to/request-info';

export class ToBlockmlRequestInfo extends RequestInfo {
  @IsEnum(ToBlockmlRequestInfoNameEnum)
  name: ToBlockmlRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

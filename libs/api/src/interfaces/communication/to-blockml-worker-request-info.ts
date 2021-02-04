import { IsEnum, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { RequestInfo } from './request-info';

export class ToBlockmlWorkerRequestInfo implements RequestInfo {
  @IsEnum(enums.ToBlockmlWorkerRequestInfoNameEnum)
  name: enums.ToBlockmlWorkerRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

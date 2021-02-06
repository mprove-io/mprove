import { IsEnum, IsString } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { enums } from '~api-to-blockml/barrels/enums';

export class ToBlockmlWorkerRequestInfo implements common.RequestInfo {
  @IsEnum(enums.ToBlockmlWorkerRequestInfoNameEnum)
  name: enums.ToBlockmlWorkerRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

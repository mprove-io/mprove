import { IsEnum, IsString } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { enums } from '~api-to-blockml/barrels/enums';

export class ToBlockmlRequestInfo implements common.RequestInfo {
  @IsEnum(enums.ToBlockmlRequestInfoNameEnum)
  name: enums.ToBlockmlRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

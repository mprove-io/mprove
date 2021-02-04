import { IsEnum, IsString } from 'class-validator';
import { enums } from '~api/barrels/enums';
import { RequestInfo } from './request-info';

export class ToDiskRequestInfo implements RequestInfo {
  @IsEnum(enums.ToDiskRequestInfoNameEnum)
  name: enums.ToDiskRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

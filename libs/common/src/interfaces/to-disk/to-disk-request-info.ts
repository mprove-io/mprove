import { IsEnum, IsString } from 'class-validator';
import { ToDiskRequestInfoNameEnum } from '#common/enums/to/to-disk-request-info-name.enum';
import { RequestInfo } from '../to/request-info';

export class ToDiskRequestInfo extends RequestInfo {
  @IsEnum(ToDiskRequestInfoNameEnum)
  name: ToDiskRequestInfoNameEnum;

  @IsString()
  traceId: string;
}

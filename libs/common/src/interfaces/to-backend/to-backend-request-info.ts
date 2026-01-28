import { IsEnum, IsString } from 'class-validator';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { RequestInfo } from '../to/request-info';

export class ToBackendRequestInfo extends RequestInfo {
  @IsEnum(ToBackendRequestInfoNameEnum)
  name: ToBackendRequestInfoNameEnum;

  @IsString()
  traceId: string;

  @IsString()
  idempotencyKey: string;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetUserTimezoneRequestPayload {
  @IsString()
  timezone: string;
}

export class ToBackendSetUserTimezoneRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserTimezoneRequestPayload)
  payload: ToBackendSetUserTimezoneRequestPayload;
}

export class ToBackendSetUserTimezoneResponsePayload {
  @ValidateNested()
  @Type(() => common.User)
  user: common.User;
}

export class ToBackendSetUserTimezoneResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserTimezoneResponsePayload)
  payload: ToBackendSetUserTimezoneResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { User } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetUserTimezoneRequestPayload {
  @IsString()
  readonly timezone: string;
}

export class ToBackendSetUserTimezoneRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserTimezoneRequestPayload)
  readonly payload: ToBackendSetUserTimezoneRequestPayload;
}

export class ToBackendSetUserTimezoneResponsePayload {
  @ValidateNested()
  @Type(() => User)
  readonly user: User;
}

export class ToBackendSetUserTimezoneResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserTimezoneResponsePayload)
  readonly payload: ToBackendSetUserTimezoneResponsePayload;
}

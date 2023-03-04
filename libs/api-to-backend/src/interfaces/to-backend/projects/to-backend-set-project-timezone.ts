import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';
import { IsTimezone } from '~common/functions/is-timezone';

export class ToBackendSetProjectTimezoneRequestPayload {
  @IsString()
  projectId: string;

  @IsTimezone()
  timezone: string;
}

export class ToBackendSetProjectTimezoneRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectTimezoneRequestPayload)
  payload: ToBackendSetProjectTimezoneRequestPayload;
}

export class ToBackendSetProjectTimezoneResponsePayload {
  @ValidateNested()
  @Type(() => common.Project)
  project: common.Project;
}

export class ToBackendSetProjectTimezoneResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectTimezoneResponsePayload)
  payload: ToBackendSetProjectTimezoneResponsePayload;
}

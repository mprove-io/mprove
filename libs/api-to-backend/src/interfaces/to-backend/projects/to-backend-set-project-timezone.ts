import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetProjectTimezoneRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  timezone: string;
}

export class ToBackendSetProjectTimezoneRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectTimezoneRequestPayload)
  payload: ToBackendSetProjectTimezoneRequestPayload;
}

export class ToBackendSetProjectTimezoneResponsePayload {
  @IsString()
  project: common.Project;
}

export class ToBackendSetProjectTimezoneResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectTimezoneResponsePayload)
  payload: ToBackendSetProjectTimezoneResponsePayload;
}

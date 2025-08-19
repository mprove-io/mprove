import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { IsTimezone } from '~common/functions/is-timezone';
import { Project } from '~common/interfaces/backend/project';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Project)
  project: Project;
}

export class ToBackendSetProjectTimezoneResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectTimezoneResponsePayload)
  payload: ToBackendSetProjectTimezoneResponsePayload;
}

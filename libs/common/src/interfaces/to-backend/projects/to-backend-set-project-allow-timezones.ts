import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetProjectAllowTimezonesRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  allowTimezones: boolean;
}

export class ToBackendSetProjectAllowTimezonesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectAllowTimezonesRequestPayload)
  payload: ToBackendSetProjectAllowTimezonesRequestPayload;
}

export class ToBackendSetProjectAllowTimezonesResponsePayload {
  @ValidateNested()
  @Type(() => Project)
  project: Project;
}

export class ToBackendSetProjectAllowTimezonesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectAllowTimezonesResponsePayload)
  payload: ToBackendSetProjectAllowTimezonesResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Project)
  project: common.Project;
}

export class ToBackendSetProjectAllowTimezonesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectAllowTimezonesResponsePayload)
  payload: ToBackendSetProjectAllowTimezonesResponsePayload;
}

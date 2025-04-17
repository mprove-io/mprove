import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditEnvVarRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;

  @IsString()
  val: string;
}

export class ToBackendEditEnvVarRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditEnvVarRequestPayload)
  payload: ToBackendEditEnvVarRequestPayload;
}

export class ToBackendEditEnvVarResponsePayload {
  @ValidateNested()
  @Type(() => common.Ev)
  ev: common.Ev;
}

export class ToBackendEditEnvVarResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditEnvVarResponsePayload)
  payload: ToBackendEditEnvVarResponsePayload;
}

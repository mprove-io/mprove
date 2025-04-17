import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateEnvVarRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;

  @IsString()
  val: string;
}

export class ToBackendCreateEnvVarRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvVarRequestPayload)
  payload: ToBackendCreateEnvVarRequestPayload;
}

export class ToBackendCreateEnvVarResponsePayload {
  @ValidateNested()
  @Type(() => common.Ev)
  ev: common.Ev;
}

export class ToBackendCreateEnvVarResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvVarResponsePayload)
  payload: ToBackendCreateEnvVarResponsePayload;
}

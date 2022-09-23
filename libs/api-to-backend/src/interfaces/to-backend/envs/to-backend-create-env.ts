import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateEnvRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendCreateEnvRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvRequestPayload)
  payload: ToBackendCreateEnvRequestPayload;
}

export class ToBackendCreateEnvResponsePayload {
  @ValidateNested()
  @Type(() => common.Env)
  env: common.Env;
}

export class ToBackendCreateEnvResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvResponsePayload)
  payload: ToBackendCreateEnvResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteEnvVarRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  evId: string;
}

export class ToBackendDeleteEnvVarRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvVarRequestPayload)
  payload: ToBackendDeleteEnvVarRequestPayload;
}

export class ToBackendDeleteEnvVarResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Env)
  envs: common.Env[];
}

export class ToBackendDeleteEnvVarResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvVarResponsePayload)
  payload: ToBackendDeleteEnvVarResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteEnvUserRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  envUserId: string;
}

export class ToBackendDeleteEnvUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvUserRequestPayload)
  payload: ToBackendDeleteEnvUserRequestPayload;
}

export class ToBackendDeleteEnvUserResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Env)
  envs: common.Env[];
}

export class ToBackendDeleteEnvUserResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvUserResponsePayload)
  payload: ToBackendDeleteEnvUserResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '#common/interfaces/backend/env';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendDeleteEnvUserResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvUserResponsePayload)
  payload: ToBackendDeleteEnvUserResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '~common/interfaces/backend/env';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateEnvUserRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  envUserId: string;
}

export class ToBackendCreateEnvUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvUserRequestPayload)
  payload: ToBackendCreateEnvUserRequestPayload;
}

export class ToBackendCreateEnvUserResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendCreateEnvUserResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvUserResponsePayload)
  payload: ToBackendCreateEnvUserResponsePayload;
}

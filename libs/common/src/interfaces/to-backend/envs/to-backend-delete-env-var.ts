import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '~common/interfaces/backend/env';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendDeleteEnvVarResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvVarResponsePayload)
  payload: ToBackendDeleteEnvVarResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '~common/interfaces/backend/env';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendEditEnvVarResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditEnvVarResponsePayload)
  payload: ToBackendEditEnvVarResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '~common/interfaces/backend/env';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendCreateEnvVarResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvVarResponsePayload)
  payload: ToBackendCreateEnvVarResponsePayload;
}

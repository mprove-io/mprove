import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '#common/interfaces/backend/env';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendCreateEnvResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateEnvResponsePayload)
  payload: ToBackendCreateEnvResponsePayload;
}

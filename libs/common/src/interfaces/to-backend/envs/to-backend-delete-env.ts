import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '#common/interfaces/backend/env';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteEnvRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendDeleteEnvRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvRequestPayload)
  payload: ToBackendDeleteEnvRequestPayload;
}

export class ToBackendDeleteEnvResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendDeleteEnvResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteEnvResponsePayload)
  payload: ToBackendDeleteEnvResponsePayload;
}

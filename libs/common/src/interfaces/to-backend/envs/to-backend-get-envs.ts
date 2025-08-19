import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Env } from '~common/interfaces/backend/env';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetEnvsRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetEnvsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetEnvsRequestPayload)
  payload: ToBackendGetEnvsRequestPayload;
}

export class ToBackendGetEnvsResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Env)
  envs: Env[];
}

export class ToBackendGetEnvsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetEnvsResponsePayload)
  payload: ToBackendGetEnvsResponsePayload;
}

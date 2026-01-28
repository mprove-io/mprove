import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { EnvUser } from '#common/interfaces/backend/env-user';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetMembersListRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetMembersListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetMembersListRequestPayload)
  payload: ToBackendGetMembersListRequestPayload;
}

export class ToBackendGetMembersListResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => EnvUser)
  membersList: EnvUser[];
}

export class ToBackendGetMembersListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMembersListResponsePayload)
  payload: ToBackendGetMembersListResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.EnvUser)
  membersList: common.EnvUser[];
}

export class ToBackendGetMembersListResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMembersListResponsePayload)
  payload: ToBackendGetMembersListResponsePayload;
}

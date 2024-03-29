import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetMembersRequestPayload {
  @IsString()
  projectId: string;

  @IsInt()
  pageNum: number;

  @IsInt()
  perPage: number;
}

export class ToBackendGetMembersRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetMembersRequestPayload)
  payload: ToBackendGetMembersRequestPayload;
}

export class ToBackendGetMembersResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Member)
  members: common.Member[];

  @IsInt()
  total: number;
}

export class ToBackendGetMembersResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMembersResponsePayload)
  payload: ToBackendGetMembersResponsePayload;
}

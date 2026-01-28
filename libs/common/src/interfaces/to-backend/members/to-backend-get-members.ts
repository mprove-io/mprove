import { Type } from 'class-transformer';
import { IsInt, IsString, ValidateNested } from 'class-validator';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Member)
  members: Member[];

  @IsInt()
  total: number;
}

export class ToBackendGetMembersResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMembersResponsePayload)
  payload: ToBackendGetMembersResponsePayload;
}

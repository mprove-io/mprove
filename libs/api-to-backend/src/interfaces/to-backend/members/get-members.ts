import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Member } from '~api-to-backend/interfaces/ints/member';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetMembersRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetMembersRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetMembersRequestPayload)
  payload: ToBackendGetMembersRequestPayload;
}

export class ToBackendGetMembersResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  projectMembers: Member[];
}

export class ToBackendGetMembersResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMembersResponsePayload)
  payload: ToBackendGetMembersResponsePayload;
}

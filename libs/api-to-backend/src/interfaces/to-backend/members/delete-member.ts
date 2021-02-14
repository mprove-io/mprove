import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Member } from '~api-to-backend/interfaces/ints/member';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteMemberRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  memberId: string;
}

export class ToBackendDeleteMemberRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteMemberRequestPayload)
  payload: ToBackendDeleteMemberRequestPayload;
}

export class ToBackendDeleteMemberResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  projectMembers: Member[];
}

export class ToBackendDeleteMemberResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteMemberResponsePayload)
  payload: ToBackendDeleteMemberResponsePayload;
}

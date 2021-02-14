import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Member } from '~api-to-backend/interfaces/ints/member';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateMemberRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  email: string;
}

export class ToBackendCreateMemberRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateMemberRequestPayload)
  payload: ToBackendCreateMemberRequestPayload;
}

export class ToBackendCreateMemberResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  member: Member;
}

export class ToBackendCreateMemberResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateMemberResponsePayload)
  payload: ToBackendCreateMemberResponsePayload;
}

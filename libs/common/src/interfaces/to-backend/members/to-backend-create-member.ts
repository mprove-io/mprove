import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Member } from '#common/interfaces/backend/member';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendCreateMemberResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateMemberResponsePayload)
  payload: ToBackendCreateMemberResponsePayload;
}

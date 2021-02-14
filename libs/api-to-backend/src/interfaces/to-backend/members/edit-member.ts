import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Member } from '~api-to-backend/interfaces/ints/member';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendEditMemberRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  memberId: string;

  @IsBoolean()
  isAdmin: boolean;

  @IsBoolean()
  isEditor: boolean;

  @IsBoolean()
  isExplorer: boolean;
}

export class ToBackendEditMemberRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditMemberRequestPayload)
  payload: ToBackendEditMemberRequestPayload;
}

export class ToBackendEditMemberResponsePayload {
  @ValidateNested()
  @Type(() => Member)
  member: Member;
}

export class ToBackendEditMemberResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditMemberResponsePayload)
  payload: ToBackendEditMemberResponsePayload;
}

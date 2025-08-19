import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

  @IsString({ each: true })
  roles: string[];
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

export class ToBackendEditMemberResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditMemberResponsePayload)
  payload: ToBackendEditMemberResponsePayload;
}

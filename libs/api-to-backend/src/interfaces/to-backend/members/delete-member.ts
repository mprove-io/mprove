import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
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

export class ToBackendDeleteMemberResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

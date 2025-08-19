import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendDeleteMemberResponse extends MyResponse {
  payload: { [k in any]: never };
}

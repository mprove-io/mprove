import { Type } from 'class-transformer';
import { IsBoolean, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCheckSignUpRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendCheckSignUpResponsePayload {
  @IsBoolean()
  isRegisterOnlyInvitedUsers: boolean;
}

export class ToBackendCheckSignUpResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCheckSignUpResponsePayload)
  payload: ToBackendCheckSignUpResponsePayload;
}

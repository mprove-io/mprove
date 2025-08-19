import { IsString } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendResetUserPasswordRequestPayload {
  @IsString()
  email: string;
}

export class ToBackendResetUserPasswordRequest extends ToBackendRequest {
  payload: ToBackendResetUserPasswordRequestPayload;
}

export class ToBackendResetUserPasswordResponse extends MyResponse {
  payload: { [k in any]: never };
}

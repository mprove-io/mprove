import { IsString } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendResetUserPasswordRequestPayload {
  @IsString()
  email: string;
}

export class ToBackendResetUserPasswordRequest extends ToBackendRequest {
  payload: ToBackendResetUserPasswordRequestPayload;
}

export class ToBackendResetUserPasswordResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

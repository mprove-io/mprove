import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendResetUserPasswordRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendResetUserPasswordResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

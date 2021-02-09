import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendResetUserPasswordRequest extends ToBackendRequest {
  readonly payload: { [K in any]: never };
}

export class ToBackendResetUserPasswordResponse extends common.MyResponse {
  readonly payload: { [K in any]: never };
}

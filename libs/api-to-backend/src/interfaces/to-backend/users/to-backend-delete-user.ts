import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendDeleteUserRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendDeleteUserResponse extends common.MyResponse {
  payload: { [k in any]: never };
}

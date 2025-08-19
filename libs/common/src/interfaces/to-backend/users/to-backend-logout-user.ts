import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendLogoutUserRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendLogoutUserResponse extends MyResponse {
  payload: { [k in any]: never };
}

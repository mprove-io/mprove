import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteUserRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendDeleteUserResponse extends MyResponse {
  payload: { [k in any]: never };
}

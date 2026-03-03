import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteUserApiKeyRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendDeleteUserApiKeyResponse extends MyResponse {
  payload: { [k in any]: never };
}

import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { User } from '#common/interfaces/backend/user';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteUserCodexAuthRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendDeleteUserCodexAuthResponsePayload {
  @ValidateNested()
  @Type(() => User)
  user: User;
}

export class ToBackendDeleteUserCodexAuthResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteUserCodexAuthResponsePayload)
  payload: ToBackendDeleteUserCodexAuthResponsePayload;
}

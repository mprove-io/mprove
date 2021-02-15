import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetUserProfileRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendGetUserProfileResponsePayload {
  @ValidateNested()
  @Type(() => common.User)
  user: common.User;
}

export class ToBackendGetUserProfileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetUserProfileResponsePayload)
  payload: ToBackendGetUserProfileResponsePayload;
}

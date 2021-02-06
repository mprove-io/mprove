import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { User } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetUserProfileRequest extends ToBackendRequest {
  readonly payload: { [K in any]: never };
}

export class ToBackendGetUserProfileResponsePayload {
  @ValidateNested()
  @Type(() => User)
  readonly user: User;
}

export class ToBackendGetUserProfileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetUserProfileResponsePayload)
  readonly payload: ToBackendGetUserProfileResponsePayload;
}

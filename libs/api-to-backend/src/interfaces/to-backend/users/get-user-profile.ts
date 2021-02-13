import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { User } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetUserProfileRequest extends ToBackendRequest {
  readonly payload: { [k in any]: never };
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

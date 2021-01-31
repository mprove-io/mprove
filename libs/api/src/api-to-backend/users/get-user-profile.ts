import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import * as apiObjects from '~/objects/_index';
import { Response, ToBackendRequest } from '~/objects/_index';

export class ToBackendGetUserProfileRequest extends ToBackendRequest {
  readonly payload: { [K in any]: never };
}

export class ToBackendGetUserProfileResponsePayload {
  @ValidateNested()
  @Type(() => apiObjects.User)
  readonly user: apiObjects.User;
}

export class ToBackendGetUserProfileResponse extends Response {
  @ValidateNested()
  @Type(() => ToBackendGetUserProfileResponsePayload)
  readonly payload: ToBackendGetUserProfileResponsePayload;
}

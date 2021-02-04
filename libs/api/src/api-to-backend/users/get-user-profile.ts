import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToBackendGetUserProfileRequest extends interfaces.ToBackendRequest {
  readonly payload: { [K in any]: never };
}

export class ToBackendGetUserProfileResponsePayload {
  @ValidateNested()
  @Type(() => interfaces.User)
  readonly user: interfaces.User;
}

export class ToBackendGetUserProfileResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetUserProfileResponsePayload)
  readonly payload: ToBackendGetUserProfileResponsePayload;
}

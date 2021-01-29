import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/api/objects/_index';
import { Response, ToBackendRequest } from '~/api/objects/_index';

export class ToBackendLoginUserRequestPayload {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}

export class ToBackendLoginUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendLoginUserRequestPayload)
  readonly payload: ToBackendLoginUserRequestPayload;
}

export class ToBackendLoginUserResponsePayload {
  @IsString()
  readonly token: string;

  @ValidateNested()
  @Type(() => apiObjects.User)
  readonly user: apiObjects.User;
}

export class ToBackendLoginUserResponse extends Response {
  @ValidateNested()
  @Type(() => ToBackendLoginUserResponsePayload)
  readonly payload: ToBackendLoginUserResponsePayload;
}

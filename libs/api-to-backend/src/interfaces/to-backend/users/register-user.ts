import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRegisterUserRequestPayload {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}

export class ToBackendRegisterUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRegisterUserRequestPayload)
  readonly payload: ToBackendRegisterUserRequestPayload;
}

export class ToBackendRegisterUserResponsePayload {
  @IsString()
  readonly userId: string;
}

export class ToBackendRegisterUserResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRegisterUserResponsePayload)
  readonly payload: ToBackendRegisterUserResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRegisterUserRequestPayload {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class ToBackendRegisterUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRegisterUserRequestPayload)
  payload: ToBackendRegisterUserRequestPayload;
}

export class ToBackendRegisterUserResponsePayload {
  @ValidateNested()
  @Type(() => common.User)
  user: common.User;
}

export class ToBackendRegisterUserResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRegisterUserResponsePayload)
  payload: ToBackendRegisterUserResponsePayload;
}

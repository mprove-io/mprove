import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { User } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendLoginUserRequestPayload {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class ToBackendLoginUserRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendLoginUserRequestPayload)
  payload: ToBackendLoginUserRequestPayload;
}

export class ToBackendLoginUserResponsePayload {
  @IsString()
  token: string;

  @ValidateNested()
  @Type(() => User)
  user: User;
}

export class ToBackendLoginUserResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendLoginUserResponsePayload)
  payload: ToBackendLoginUserResponsePayload;
}

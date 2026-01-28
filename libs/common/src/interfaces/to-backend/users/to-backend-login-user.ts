import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { User } from '#common/interfaces/backend/user';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendLoginUserResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendLoginUserResponsePayload)
  payload: ToBackendLoginUserResponsePayload;
}

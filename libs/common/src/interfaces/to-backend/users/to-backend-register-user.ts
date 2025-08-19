import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { User } from '~common/interfaces/backend/user';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => User)
  user: User;
}

export class ToBackendRegisterUserResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRegisterUserResponsePayload)
  payload: ToBackendRegisterUserResponsePayload;
}

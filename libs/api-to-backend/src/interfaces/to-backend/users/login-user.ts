import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { User } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => User)
  readonly user: User;
}

export class ToBackendLoginUserResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendLoginUserResponsePayload)
  readonly payload: ToBackendLoginUserResponsePayload;
}

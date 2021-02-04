import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToBackendRegisterUserRequestPayload {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}

export class ToBackendRegisterUserRequest extends interfaces.ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRegisterUserRequestPayload)
  readonly payload: ToBackendRegisterUserRequestPayload;
}

export class ToBackendRegisterUserResponsePayload {
  @IsString()
  readonly userId: string;
}

export class ToBackendRegisterUserResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRegisterUserResponsePayload)
  readonly payload: ToBackendRegisterUserResponsePayload;
}

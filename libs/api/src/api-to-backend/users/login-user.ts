import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { interfaces } from '~api/barrels/interfaces';

export class ToBackendLoginUserRequestPayload {
  @IsString()
  readonly email: string;

  @IsString()
  readonly password: string;
}

export class ToBackendLoginUserRequest extends interfaces.ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendLoginUserRequestPayload)
  readonly payload: ToBackendLoginUserRequestPayload;
}

export class ToBackendLoginUserResponsePayload {
  @IsString()
  readonly token: string;

  @ValidateNested()
  @Type(() => interfaces.User)
  readonly user: interfaces.User;
}

export class ToBackendLoginUserResponse extends interfaces.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendLoginUserResponsePayload)
  readonly payload: ToBackendLoginUserResponsePayload;
}

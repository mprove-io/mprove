import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { User } from '~common/interfaces/backend/user';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCompleteUserRegistrationRequestPayload {
  @IsString()
  emailConfirmationToken: string;

  @IsString()
  newPassword: string;
}

export class ToBackendCompleteUserRegistrationRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCompleteUserRegistrationRequestPayload)
  payload: ToBackendCompleteUserRegistrationRequestPayload;
}

export class ToBackendCompleteUserRegistrationResponsePayload {
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => User)
  user?: User;
}

export class ToBackendCompleteUserRegistrationResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCompleteUserRegistrationResponsePayload)
  payload: ToBackendCompleteUserRegistrationResponsePayload;
}

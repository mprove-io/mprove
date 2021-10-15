import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.User)
  user?: common.User;
}

export class ToBackendCompleteUserRegistrationResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCompleteUserRegistrationResponsePayload)
  payload: ToBackendCompleteUserRegistrationResponsePayload;
}

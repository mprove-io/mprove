import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../objects/_index';

export class ToBackendRegisterUserRequestPayload {
  @IsString()
  readonly userId: string;

  @IsString()
  readonly password: string;
}

export class ToBackendRegisterUserRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBackendRequestInfo)
  readonly info: apiObjects.ToBackendRequestInfo;

  @ValidateNested()
  @Type(() => ToBackendRegisterUserRequestPayload)
  readonly payload: ToBackendRegisterUserRequestPayload;
}

export class ToBackendRegisterUserResponsePayload {
  @IsString()
  readonly userId: string;
}

export class ToBackendRegisterUserResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToBackendRegisterUserResponsePayload)
  readonly payload: ToBackendRegisterUserResponsePayload;
}
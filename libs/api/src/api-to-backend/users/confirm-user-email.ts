import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/objects/_index';

export class ToBackendConfirmUserEmailRequestPayload {
  @IsString()
  readonly token: string;
}

export class ToBackendConfirmUserEmailRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBackendRequestInfo)
  readonly info: apiObjects.ToBackendRequestInfo;

  @ValidateNested()
  @Type(() => ToBackendConfirmUserEmailRequestPayload)
  readonly payload: ToBackendConfirmUserEmailRequestPayload;
}

export class ToBackendConfirmUserEmailResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  readonly payload: { [K in any]: never };
}

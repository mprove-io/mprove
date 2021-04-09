import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendResendUserEmailRequestPayload {
  @IsString()
  userId: string;
}

export class ToBackendResendUserEmailRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendResendUserEmailRequestPayload)
  payload: ToBackendResendUserEmailRequestPayload;
}

export class ToBackendResendUserEmailResponsePayload {
  @IsBoolean()
  isEmailVerified: boolean;
}

export class ToBackendResendUserEmailResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendResendUserEmailResponsePayload)
  payload: ToBackendResendUserEmailResponsePayload;
}

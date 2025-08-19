import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendResendUserEmailResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendResendUserEmailResponsePayload)
  payload: ToBackendResendUserEmailResponsePayload;
}

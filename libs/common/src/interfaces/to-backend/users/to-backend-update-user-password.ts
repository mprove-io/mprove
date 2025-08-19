import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendUpdateUserPasswordRequestPayload {
  @IsString()
  passwordResetToken: string;

  @IsString()
  newPassword: string;
}

export class ToBackendUpdateUserPasswordRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendUpdateUserPasswordRequestPayload)
  payload: ToBackendUpdateUserPasswordRequestPayload;
}

export class ToBackendUpdateUserPasswordResponse extends MyResponse {
  payload: { [k in any]: never };
}

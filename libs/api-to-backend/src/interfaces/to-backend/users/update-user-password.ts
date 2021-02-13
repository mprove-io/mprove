import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendUpdateUserPasswordRequestPayload {
  @IsString()
  readonly passwordResetToken: string;

  @IsString()
  readonly newPassword: string;
}

export class ToBackendUpdateUserPasswordRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendUpdateUserPasswordRequestPayload)
  readonly payload: ToBackendUpdateUserPasswordRequestPayload;
}

export class ToBackendUpdateUserPasswordResponse extends common.MyResponse {
  readonly payload: { [k in any]: never };
}

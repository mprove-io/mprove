import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendConfirmUserEmailRequestPayload {
  @IsString()
  readonly token: string;
}

export class ToBackendConfirmUserEmailRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendConfirmUserEmailRequestPayload)
  readonly payload: ToBackendConfirmUserEmailRequestPayload;
}

export class ToBackendConfirmUserEmailResponse extends common.MyResponse {
  readonly payload: { [K in any]: never };
}

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendConfirmUserEmailRequestPayload {
  @IsString()
  token: string;
}

export class ToBackendConfirmUserEmailRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendConfirmUserEmailRequestPayload)
  payload: ToBackendConfirmUserEmailRequestPayload;
}

export class ToBackendConfirmUserEmailResponsePayload {
  @IsOptional()
  @IsString()
  token?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => common.User)
  user?: common.User;
}

export class ToBackendConfirmUserEmailResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendConfirmUserEmailResponsePayload)
  payload: ToBackendConfirmUserEmailResponsePayload;
}

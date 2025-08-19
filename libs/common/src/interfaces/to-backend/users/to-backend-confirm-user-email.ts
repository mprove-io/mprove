import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { User } from '~common/interfaces/backend/user';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => User)
  user?: User;
}

export class ToBackendConfirmUserEmailResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendConfirmUserEmailResponsePayload)
  payload: ToBackendConfirmUserEmailResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { User } from '#common/interfaces/backend/user';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetUserCodexAuthRequestPayload {
  @IsString()
  authJson: string;
}

export class ToBackendSetUserCodexAuthRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserCodexAuthRequestPayload)
  payload: ToBackendSetUserCodexAuthRequestPayload;
}

export class ToBackendSetUserCodexAuthResponsePayload {
  @ValidateNested()
  @Type(() => User)
  user: User;
}

export class ToBackendSetUserCodexAuthResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserCodexAuthResponsePayload)
  payload: ToBackendSetUserCodexAuthResponsePayload;
}

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetAvatarRequestPayload {
  @IsOptional()
  @IsString()
  avatarBig: string;

  @IsString()
  avatarSmall: string;
}

export class ToBackendSetAvatarRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetAvatarRequestPayload)
  payload: ToBackendSetAvatarRequestPayload;
}

export class ToBackendSetAvatarResponsePayload {
  @IsString()
  avatarSmall: string;

  @IsString()
  avatarBig: string;
}

export class ToBackendSetAvatarResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetAvatarResponsePayload)
  payload: ToBackendSetAvatarResponsePayload;
}

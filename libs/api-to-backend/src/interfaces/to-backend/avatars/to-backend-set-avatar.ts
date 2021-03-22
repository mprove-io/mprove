import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetAvatarRequestPayload {
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
}

export class ToBackendSetAvatarResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetAvatarResponsePayload)
  payload: ToBackendSetAvatarResponsePayload;
}

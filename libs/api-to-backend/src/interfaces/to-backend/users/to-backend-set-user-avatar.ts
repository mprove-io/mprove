import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSetUserAvatarRequestPayload {
  @IsString()
  avatarUrlSmall: string;

  @IsString()
  avatarUrlBig: string;
}

export class ToBackendSetUserAvatarRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetUserAvatarRequestPayload)
  payload: ToBackendSetUserAvatarRequestPayload;
}

export class ToBackendSetUserAvatarResponsePayload {
  @ValidateNested()
  @Type(() => common.User)
  user: common.User;
}

export class ToBackendSetUserAvatarResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetUserAvatarResponsePayload)
  payload: ToBackendSetUserAvatarResponsePayload;
}

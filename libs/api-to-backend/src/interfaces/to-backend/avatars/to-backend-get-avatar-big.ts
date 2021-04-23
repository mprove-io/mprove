import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetAvatarBigRequestPayload {
  @IsString()
  avatarUserId: string;
}

export class ToBackendGetAvatarBigRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetAvatarBigRequestPayload)
  payload: ToBackendGetAvatarBigRequestPayload;
}

export class ToBackendGetAvatarBigResponsePayload {
  @IsString()
  avatarSmall: string;

  @IsString()
  avatarBig: string;
}

export class ToBackendGetAvatarBigResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAvatarBigResponsePayload)
  payload: ToBackendGetAvatarBigResponsePayload;
}

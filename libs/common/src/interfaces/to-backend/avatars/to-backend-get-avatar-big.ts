import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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

export class ToBackendGetAvatarBigResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetAvatarBigResponsePayload)
  payload: ToBackendGetAvatarBigResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGenerateProjectRemoteKeyRequestPayload {
  @IsString()
  orgId: string;
}

export class ToBackendGenerateProjectRemoteKeyRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGenerateProjectRemoteKeyRequestPayload)
  payload: ToBackendGenerateProjectRemoteKeyRequestPayload;
}

export class ToBackendGenerateProjectRemoteKeyResponsePayload {
  @IsString()
  noteId: string;

  @IsString()
  publicKey: string;
}

export class ToBackendGenerateProjectRemoteKeyResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGenerateProjectRemoteKeyResponsePayload)
  payload: ToBackendGenerateProjectRemoteKeyResponsePayload;
}

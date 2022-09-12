import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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

export class ToBackendGenerateProjectRemoteKeyResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGenerateProjectRemoteKeyResponsePayload)
  payload: ToBackendGenerateProjectRemoteKeyResponsePayload;
}

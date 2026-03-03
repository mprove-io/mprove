import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGenerateUserApiKeyRequest extends ToBackendRequest {
  payload: { [k in any]: never };
}

export class ToBackendGenerateUserApiKeyResponsePayload {
  @IsString()
  apiKey: string;

  @IsString()
  apiKeyPrefix: string;
}

export class ToBackendGenerateUserApiKeyResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGenerateUserApiKeyResponsePayload)
  payload: ToBackendGenerateUserApiKeyResponsePayload;
}

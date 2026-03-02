import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Project } from '#common/interfaces/backend/project';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetProjectApiKeyRequestPayload {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  zenApiKey?: string;

  @IsOptional()
  @IsString()
  anthropicApiKey?: string;

  @IsOptional()
  @IsString()
  openaiApiKey?: string;

  @IsOptional()
  @IsString()
  e2bApiKey?: string;
}

export class ToBackendSetProjectApiKeyRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectApiKeyRequestPayload)
  payload: ToBackendSetProjectApiKeyRequestPayload;
}

export class ToBackendSetProjectApiKeyResponsePayload {
  @ValidateNested()
  @Type(() => Project)
  project: Project;
}

export class ToBackendSetProjectApiKeyResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectApiKeyResponsePayload)
  payload: ToBackendSetProjectApiKeyResponsePayload;
}

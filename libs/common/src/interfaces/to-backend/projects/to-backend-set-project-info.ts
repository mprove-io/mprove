import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Project } from '#common/interfaces/backend/project';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSetProjectInfoRequestPayload {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  name?: string;

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

export class ToBackendSetProjectInfoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSetProjectInfoRequestPayload)
  payload: ToBackendSetProjectInfoRequestPayload;
}

export class ToBackendSetProjectInfoResponsePayload {
  @ValidateNested()
  @Type(() => Project)
  project: Project;
}

export class ToBackendSetProjectInfoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSetProjectInfoResponsePayload)
  payload: ToBackendSetProjectInfoResponsePayload;
}

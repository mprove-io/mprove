import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ConnectionOptions } from '#common/interfaces/backend/connection-parts/connection-options';
import { ProjectConnection } from '#common/interfaces/backend/project-connection';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendEditConnectionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;

  @IsString()
  connectionId: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ConnectionOptions)
  options: ConnectionOptions;
}

export class ToBackendEditConnectionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionRequestPayload)
  payload: ToBackendEditConnectionRequestPayload;
}

export class ToBackendEditConnectionResponsePayload {
  @ValidateNested()
  @Type(() => ProjectConnection)
  connection: ProjectConnection;
}

export class ToBackendEditConnectionResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendEditConnectionResponsePayload)
  payload: ToBackendEditConnectionResponsePayload;
}

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { ConnectionTabOptions } from '~common/interfaces/backend/connection/connection-tab-options';
import { ProjectConnection } from '~common/interfaces/backend/project-connection';
import { MyResponse } from '~common/interfaces/to/my-response';
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
  @Type(() => ConnectionTabOptions)
  options?: ConnectionTabOptions;
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

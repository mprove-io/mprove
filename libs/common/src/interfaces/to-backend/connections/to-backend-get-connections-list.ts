import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';
import type { ConnectionItem } from './connection-item';

export class ToBackendGetConnectionsListRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetConnectionsListRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionsListRequestPayload)
  payload: ToBackendGetConnectionsListRequestPayload;
}

export class ToBackendGetConnectionsListResponsePayload {
  connectionItems: ConnectionItem[];
}

export class ToBackendGetConnectionsListResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionsListResponsePayload)
  payload: ToBackendGetConnectionsListResponsePayload;
}

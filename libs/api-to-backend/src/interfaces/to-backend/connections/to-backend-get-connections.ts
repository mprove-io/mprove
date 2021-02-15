import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { Connection } from '~api-to-backend/interfaces/ints/_index';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetConnectionsRequestPayload {
  @IsString()
  projectId: string;
}

export class ToBackendGetConnectionsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionsRequestPayload)
  payload: ToBackendGetConnectionsRequestPayload;
}

export class ToBackendGetConnectionsResponsePayload {
  @ValidateNested()
  @Type(() => Connection)
  connections: Connection[];
}

export class ToBackendGetConnectionsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionsResponsePayload)
  payload: ToBackendGetConnectionsResponsePayload;
}

import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetConnectionsRequestPayload {
  @IsString()
  projectId: string;

  @IsOptional()
  @IsString()
  envId?: string;
}

export class ToBackendGetConnectionsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionsRequestPayload)
  payload: ToBackendGetConnectionsRequestPayload;
}

export class ToBackendGetConnectionsResponsePayload {
  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Connection)
  connections: common.Connection[];
}

export class ToBackendGetConnectionsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionsResponsePayload)
  payload: ToBackendGetConnectionsResponsePayload;
}

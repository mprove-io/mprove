import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Connection } from '~common/interfaces/backend/connection';
import { Member } from '~common/interfaces/backend/member';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

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
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => Connection)
  connections: Connection[];
}

export class ToBackendGetConnectionsResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetConnectionsResponsePayload)
  payload: ToBackendGetConnectionsResponsePayload;
}

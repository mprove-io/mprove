import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Query } from '#common/interfaces/blockml/query';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetQueryRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;
}

export class ToBackendGetQueryRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetQueryRequestPayload)
  payload: ToBackendGetQueryRequestPayload;
}

export class ToBackendGetQueryResponsePayload {
  @ValidateNested()
  @Type(() => Query)
  query: Query;
}

export class ToBackendGetQueryResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetQueryResponsePayload)
  payload: ToBackendGetQueryResponsePayload;
}

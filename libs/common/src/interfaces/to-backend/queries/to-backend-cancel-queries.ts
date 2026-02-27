import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Query } from '#common/interfaces/blockml/query';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCancelQueriesRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  mconfigIds: string[];
}

export class ToBackendCancelQueriesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCancelQueriesRequestPayload)
  payload: ToBackendCancelQueriesRequestPayload;
}

export class ToBackendCancelQueriesResponsePayload {
  @ValidateNested()
  @Type(() => Query)
  queries: Query[];
}

export class ToBackendCancelQueriesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCancelQueriesResponsePayload)
  payload: ToBackendCancelQueriesResponsePayload;
}

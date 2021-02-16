import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRunQueriesRequestPayload {
  @IsString({ each: true })
  queryIds: string[];
}

export class ToBackendRunQueriesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesRequestPayload)
  payload: ToBackendRunQueriesRequestPayload;
}

export class ToBackendRunQueriesResponsePayload {
  @ValidateNested()
  @Type(() => common.Query)
  runningQueries: common.Query[];
}

export class ToBackendRunQueriesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesResponsePayload)
  payload: ToBackendRunQueriesResponsePayload;
}

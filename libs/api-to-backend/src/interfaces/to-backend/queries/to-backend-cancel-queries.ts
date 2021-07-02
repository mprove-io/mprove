import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCancelQueriesRequestPayload {
  @IsString({ each: true })
  queryIds: string[];
}

export class ToBackendCancelQueriesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCancelQueriesRequestPayload)
  payload: ToBackendCancelQueriesRequestPayload;
}

export class ToBackendCancelQueriesResponsePayload {
  @ValidateNested()
  @Type(() => common.Query)
  queries: common.Query[];
}

export class ToBackendCancelQueriesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCancelQueriesResponsePayload)
  payload: ToBackendCancelQueriesResponsePayload;
}

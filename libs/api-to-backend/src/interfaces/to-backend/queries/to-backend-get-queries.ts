import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetQueriesRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString({ each: true })
  queryIds: string[];
}

export class ToBackendGetQueriesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetQueriesRequestPayload)
  payload: ToBackendGetQueriesRequestPayload;
}

export class ToBackendGetQueriesResponsePayload {
  @ValidateNested()
  @Type(() => common.Query)
  queries: common.Query[];
}

export class ToBackendGetQueriesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetQueriesResponsePayload)
  payload: ToBackendGetQueriesResponsePayload;
}

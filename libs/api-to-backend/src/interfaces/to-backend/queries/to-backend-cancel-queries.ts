import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCancelQueriesRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

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
  @Type(() => common.Query)
  queries: common.Query[];
}

export class ToBackendCancelQueriesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCancelQueriesResponsePayload)
  payload: ToBackendCancelQueriesResponsePayload;
}

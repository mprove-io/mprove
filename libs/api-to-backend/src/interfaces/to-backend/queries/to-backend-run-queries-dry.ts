import { Type } from 'class-transformer';
import { ArrayNotEmpty, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRunQueriesDryRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  dryId: string;

  @ArrayNotEmpty()
  @IsString({ each: true })
  queryIds: string[];
}

export class ToBackendRunQueriesDryRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesDryRequestPayload)
  payload: ToBackendRunQueriesDryRequestPayload;
}

export class ToBackendRunQueriesDryResponsePayload {
  @IsString()
  dryId: string;

  @ValidateNested()
  @Type(() => common.QueryEstimate)
  validQueryEstimates: common.QueryEstimate[];

  @ValidateNested()
  @Type(() => common.Query)
  errorQueries: common.Query[];
}

export class ToBackendRunQueriesDryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesDryResponsePayload)
  payload: ToBackendRunQueriesDryResponsePayload;
}

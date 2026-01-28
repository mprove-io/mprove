import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsString,
  ValidateNested
} from 'class-validator';
import { QueryEstimate } from '#common/interfaces/backend/query-estimate';
import { Query } from '#common/interfaces/blockml/query';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRunQueriesDryRequestPayload {
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

  @IsString()
  dryId: string;
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
  @Type(() => QueryEstimate)
  validQueryEstimates: QueryEstimate[];

  @ValidateNested()
  @Type(() => Query)
  errorQueries: Query[];
}

export class ToBackendRunQueriesDryResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesDryResponsePayload)
  payload: ToBackendRunQueriesDryResponsePayload;
}

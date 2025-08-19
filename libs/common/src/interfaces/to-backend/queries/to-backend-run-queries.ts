import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  ValidateNested
} from 'class-validator';
import { Query } from '~common/interfaces/blockml/query';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRunQueriesRequestPayload {
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

  @IsOptional()
  @IsInt()
  @IsPositive()
  poolSize?: number;
}

export class ToBackendRunQueriesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesRequestPayload)
  payload: ToBackendRunQueriesRequestPayload;
}

export class ToBackendRunQueriesResponsePayload {
  @ValidateNested()
  @Type(() => Query)
  runningQueries: Query[];

  @IsString({ each: true })
  startedQueryIds: string[];
}

export class ToBackendRunQueriesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesResponsePayload)
  payload: ToBackendRunQueriesResponsePayload;
}

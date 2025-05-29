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
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Query)
  runningQueries: common.Query[];

  @IsString({ each: true })
  startedQueryIds: string[];
}

export class ToBackendRunQueriesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRunQueriesResponsePayload)
  payload: ToBackendRunQueriesResponsePayload;
}

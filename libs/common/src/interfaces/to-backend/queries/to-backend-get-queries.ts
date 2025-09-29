import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsBoolean,
  IsString,
  ValidateNested
} from 'class-validator';
import { Query } from '~common/interfaces/blockml/query';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendGetQueriesRequestPayload {
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

  @IsBoolean()
  skipData: boolean;
}

export class ToBackendGetQueriesRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetQueriesRequestPayload)
  payload: ToBackendGetQueriesRequestPayload;
}

export class ToBackendGetQueriesResponsePayload {
  @ValidateNested()
  @Type(() => Query)
  queries: Query[];
}

export class ToBackendGetQueriesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetQueriesResponsePayload)
  payload: ToBackendGetQueriesResponsePayload;
}

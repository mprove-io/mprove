import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetQueryRequestPayload {
  @IsString()
  mconfigId: string;

  @IsString()
  queryId: string;

  @IsOptional()
  @IsString()
  vizId?: string;

  @IsOptional()
  @IsString()
  dashboardId?: string;
}

export class ToBackendGetQueryRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetQueryRequestPayload)
  payload: ToBackendGetQueryRequestPayload;
}

export class ToBackendGetQueryResponsePayload {
  @ValidateNested()
  @Type(() => common.Query)
  query: common.Query;
}

export class ToBackendGetQueryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetQueryResponsePayload)
  payload: ToBackendGetQueryResponsePayload;
}

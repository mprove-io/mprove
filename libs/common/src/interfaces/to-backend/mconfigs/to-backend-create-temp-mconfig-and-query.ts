import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { MconfigX } from '~common/interfaces/backend/mconfig-x';
import { QueryOperation } from '~common/interfaces/backend/query-operation';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateTempMconfigAndQueryRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => Mconfig)
  mconfig: Mconfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => QueryOperation)
  queryOperations: QueryOperation[];

  @IsOptional()
  @IsNumber()
  cellMetricsStartDateMs: number;

  @IsOptional()
  @IsNumber()
  cellMetricsEndDateMs: number;
}

export class ToBackendCreateTempMconfigAndQueryRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigAndQueryRequestPayload)
  payload: ToBackendCreateTempMconfigAndQueryRequestPayload;
}

export class ToBackendCreateTempMconfigAndQueryResponsePayload {
  @ValidateNested()
  @Type(() => MconfigX)
  mconfig: MconfigX;

  @ValidateNested()
  @Type(() => Query)
  query: Query;
}

export class ToBackendCreateTempMconfigAndQueryResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigAndQueryResponsePayload)
  payload: ToBackendCreateTempMconfigAndQueryResponsePayload;
}

import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Mconfig)
  mconfig: common.Mconfig;

  @IsOptional()
  @ValidateNested()
  @Type(() => common.QueryOperation)
  queryOperation: common.QueryOperation;

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
  @Type(() => common.MconfigX)
  mconfig: common.MconfigX;

  @ValidateNested()
  @Type(() => common.Query)
  query: common.Query;
}

export class ToBackendCreateTempMconfigAndQueryResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateTempMconfigAndQueryResponsePayload)
  payload: ToBackendCreateTempMconfigAndQueryResponsePayload;
}

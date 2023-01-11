import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetMetricsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetMetricsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetMetricsRequestPayload)
  payload: ToBackendGetMetricsRequestPayload;
}

export class ToBackendGetMetricsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.BaseMetric)
  metrics: common.BaseMetric[];
}

export class ToBackendGetMetricsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetMetricsResponsePayload)
  payload: ToBackendGetMetricsResponsePayload;
}

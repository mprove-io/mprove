import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetReportsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetReportsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetReportsRequestPayload)
  payload: ToBackendGetReportsRequestPayload;
}

export class ToBackendGetReportsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  metrics: common.ModelMetric[];

  @ValidateNested()
  reports: common.ReportX[];

  @ValidateNested()
  @Type(() => common.ModelX)
  storeModels: common.ModelX[];
}

export class ToBackendGetReportsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetReportsResponsePayload)
  payload: ToBackendGetReportsResponsePayload;
}

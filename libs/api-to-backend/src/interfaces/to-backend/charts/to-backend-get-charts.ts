import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetChartsRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendGetChartsRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetChartsRequestPayload)
  payload: ToBackendGetChartsRequestPayload;
}

export class ToBackendGetChartsResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.ModelX)
  models: common.ModelX[];

  @ValidateNested()
  @Type(() => common.ChartX)
  vizs: common.ChartX[];
}

export class ToBackendGetChartsResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetChartsResponsePayload)
  payload: ToBackendGetChartsResponsePayload;
}

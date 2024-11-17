import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';
import { IsTimezone } from '~common/_index';

export class ToBackendGetReportRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  reportId: string;

  @IsTimezone()
  timezone: string;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;
}

export class ToBackendGetReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetReportRequestPayload)
  payload: ToBackendGetReportRequestPayload;
}

export class ToBackendGetReportResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;

  @ValidateNested()
  @Type(() => common.Member)
  userMember: common.Member;

  @ValidateNested()
  @Type(() => common.Report)
  report: common.ReportX;
}

export class ToBackendGetReportResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetReportResponsePayload)
  payload: ToBackendGetReportResponsePayload;
}

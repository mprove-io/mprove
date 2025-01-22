import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';
import { IsTimezone } from '~common/functions/is-timezone';

export class ToBackendSaveCreateReportRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fromReportId: string;

  @IsString()
  newReportId: string;

  @IsString()
  title: string;

  @IsString({ each: true })
  accessRoles: string[];

  @IsString({ each: true })
  accessUsers: string[];

  @IsTimezone()
  timezone: string;

  @IsEnum(common.TimeSpecEnum)
  timeSpec: common.TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;

  @ValidateNested()
  @Type(() => common.ReportField)
  newReportFields: common.ReportField[];

  @ValidateNested()
  @Type(() => common.MconfigChart)
  chart: common.MconfigChart;
}

export class ToBackendSaveCreateReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateReportRequestPayload)
  payload: ToBackendSaveCreateReportRequestPayload;
}

export class ToBackendSaveCreateReportResponsePayload {
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

export class ToBackendSaveCreateReportResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveCreateReportResponsePayload)
  payload: ToBackendSaveCreateReportResponsePayload;
}

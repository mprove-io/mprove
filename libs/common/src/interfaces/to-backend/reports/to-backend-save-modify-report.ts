import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { IsTimezone } from '#common/functions/is-timezone';
import { Member } from '#common/interfaces/backend/member';
import { ReportX } from '#common/interfaces/backend/report-x';
import { StructX } from '#common/interfaces/backend/struct-x';
import { MconfigChart } from '#common/interfaces/blockml/mconfig-chart';
import { ReportField } from '#common/interfaces/blockml/report-field';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSaveModifyReportRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  fromReportId: string;

  @IsString()
  modReportId: string;

  @IsString()
  title: string;

  @IsString({ each: true })
  accessRoles: string[];

  @IsTimezone()
  timezone: string;

  @IsEnum(TimeSpecEnum)
  timeSpec: TimeSpecEnum;

  @IsString()
  timeRangeFractionBrick: string;

  @ValidateNested()
  @Type(() => ReportField)
  newReportFields: ReportField[];

  @ValidateNested()
  @Type(() => MconfigChart)
  chart: MconfigChart;
}

export class ToBackendSaveModifyReportRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyReportRequestPayload)
  payload: ToBackendSaveModifyReportRequestPayload;
}

export class ToBackendSaveModifyReportResponsePayload {
  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @ValidateNested()
  @Type(() => Member)
  userMember: Member;

  @ValidateNested()
  @Type(() => ReportX)
  report: ReportX;

  @ValidateNested()
  @Type(() => ReportX)
  reportPart: ReportX;
}

export class ToBackendSaveModifyReportResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSaveModifyReportResponsePayload)
  payload: ToBackendSaveModifyReportResponsePayload;
}

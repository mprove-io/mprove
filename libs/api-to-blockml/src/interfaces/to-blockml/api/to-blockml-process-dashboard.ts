import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import { ToBlockmlRequest } from '~api-to-blockml/interfaces/to-blockml/to-blockml-request';

export class ToBlockmlProcessDashboardRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  structId: string;

  @IsEnum(common.ProjectWeekStartEnum)
  weekStart: common.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => common.UdfsDict)
  udfsDict: common.UdfsDict;

  modelContents: any[];

  dashboardContent: any;

  @IsString()
  newDashboardId: string;

  @ValidateNested()
  @Type(() => common.DashboardField)
  newDashboardFields: common.DashboardField[];
}

export class ToBlockmlProcessDashboardRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardRequestPayload)
  payload: ToBlockmlProcessDashboardRequestPayload;
}

export class ToBlockmlProcessDashboardResponsePayload {
  @ValidateNested()
  @Type(() => common.Dashboard)
  dashboard: common.Dashboard;

  @ValidateNested()
  @Type(() => common.Mconfig)
  mconfigs: common.Mconfig[];

  @ValidateNested()
  @Type(() => common.Query)
  queries: common.Query[];
}

export class ToBlockmlProcessDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardResponsePayload)
  payload: ToBlockmlProcessDashboardResponsePayload;
}

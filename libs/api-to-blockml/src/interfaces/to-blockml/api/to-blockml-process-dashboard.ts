import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-blockml/barrels/common';
import {
  Dashboard,
  DashboardField,
  Mconfig,
  Query,
  UdfsDict
} from '~api-to-blockml/interfaces/ints/_index';
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
  @Type(() => UdfsDict)
  udfsDict: UdfsDict;

  modelContents: any[];

  dashboardContent: any;

  @IsString()
  newDashboardId: string;

  @ValidateNested()
  @Type(() => DashboardField)
  newDashboardFields: DashboardField[];
}

export class ToBlockmlProcessDashboardRequest extends ToBlockmlRequest {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardRequestPayload)
  payload: ToBlockmlProcessDashboardRequestPayload;
}

export class ToBlockmlProcessDashboardResponsePayload {
  @ValidateNested()
  @Type(() => Dashboard)
  dashboard: Dashboard;

  @ValidateNested()
  @Type(() => Mconfig)
  mconfigs: Mconfig[];

  @ValidateNested()
  @Type(() => Query)
  queries: Query[];
}

export class ToBlockmlProcessDashboardResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardResponsePayload)
  payload: ToBlockmlProcessDashboardResponsePayload;
}

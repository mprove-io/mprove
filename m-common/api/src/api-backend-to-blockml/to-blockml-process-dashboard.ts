import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../objects/_index';
import * as apiEnums from '../enums/_index';

export class ToBlockmlProcessDashboardRequestPayload {
  @IsString()
  readonly structId: string;

  @IsEnum(apiEnums.ProjectWeekStartEnum)
  readonly weekStart: apiEnums.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => apiObjects.UdfsDict)
  readonly udfsDict: apiObjects.UdfsDict;

  readonly modelContents: any[];

  readonly dashboardContent: any;

  @IsString()
  readonly newDashboardId: string;

  @ValidateNested()
  @Type(() => apiObjects.DashboardField)
  readonly newDashboardFields: apiObjects.DashboardField[];
}

export class ToBlockmlProcessDashboardRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBlockmlRequestInfo)
  readonly info: apiObjects.ToBlockmlRequestInfo;

  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardRequestPayload)
  readonly payload: ToBlockmlProcessDashboardRequestPayload;
}

export class ToBlockmlProcessDashboardResponsePayload {
  @ValidateNested()
  @Type(() => apiObjects.Dashboard)
  readonly dashboard: apiObjects.Dashboard;

  @ValidateNested()
  @Type(() => apiObjects.Mconfig)
  readonly mconfigs: apiObjects.Mconfig[];

  @ValidateNested()
  @Type(() => apiObjects.Query)
  readonly queries: apiObjects.Query[];
}

export class ToBlockmlProcessDashboardResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToBlockmlProcessDashboardResponsePayload)
  readonly payload: ToBlockmlProcessDashboardResponsePayload;
}

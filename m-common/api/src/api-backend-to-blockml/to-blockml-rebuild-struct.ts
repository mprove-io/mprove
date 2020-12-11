import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../objects/_index';
import * as apiEnums from '../enums/_index';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  readonly structId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsEnum(apiEnums.ProjectWeekStartEnum)
  readonly weekStart: apiEnums.ProjectWeekStartEnum;

  @ValidateNested()
  @Type(() => apiObjects.File)
  readonly files: apiObjects.File[];

  @ValidateNested()
  @Type(() => apiObjects.ProjectConnection)
  readonly connections: apiObjects.ProjectConnection[];
}

export class ToBlockmlRebuildStructRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToBlockmlRequestInfo)
  readonly info: apiObjects.ToBlockmlRequestInfo;

  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructRequestPayload)
  readonly payload: ToBlockmlRebuildStructRequestPayload;
}

export class ToBlockmlRebuildStructResponsePayload {
  @ValidateNested()
  @Type(() => apiObjects.ErrorsPack)
  readonly errorsPack: apiObjects.ErrorsPack;

  @ValidateNested()
  @Type(() => apiObjects.ViewsPack)
  readonly viewsPack: apiObjects.ViewsPack;

  @ValidateNested()
  @Type(() => apiObjects.UdfsDict)
  readonly udfsDict: apiObjects.UdfsDict;

  @ValidateNested()
  @Type(() => apiObjects.Model)
  readonly models: apiObjects.Model[];

  @ValidateNested()
  @Type(() => apiObjects.Dashboard)
  readonly dashboards: apiObjects.Dashboard[];

  // TODO: vizs

  @ValidateNested()
  @Type(() => apiObjects.Mconfig)
  readonly mconfigs: apiObjects.Mconfig[];

  @ValidateNested()
  @Type(() => apiObjects.Query)
  readonly queries: apiObjects.Query[];
}

export class ToBlockmlRebuildStructResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  readonly payload: ToBlockmlRebuildStructResponsePayload;
}

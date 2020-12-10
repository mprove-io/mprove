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
  errorsPack: apiObjects.ErrorsPack;

  @ValidateNested()
  @Type(() => apiObjects.ViewsPack)
  viewsPack: apiObjects.ViewsPack;

  @ValidateNested()
  @Type(() => apiObjects.Model)
  models: apiObjects.Model[];

  @ValidateNested()
  @Type(() => apiObjects.Dashboard)
  dashboards: apiObjects.Dashboard[];

  @ValidateNested()
  @Type(() => apiObjects.Mconfig)
  mconfigs: apiObjects.Mconfig[];

  @ValidateNested()
  @Type(() => apiObjects.Query)
  queries: apiObjects.Query[];

  // TODO: structFull udfsContent --> udfsDict, vizs
}

export class ToBlockmlRebuildStructResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  readonly payload: ToBlockmlRebuildStructResponsePayload;
}

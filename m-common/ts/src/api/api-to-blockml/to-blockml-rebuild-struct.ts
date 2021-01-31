import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~/api/enums/_index';
import * as apiObjects from '~/api/objects/_index';
import { BmlError, View } from '~/api/objects/_index';

export class ToBlockmlRebuildStructRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly structId: string;

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
  @Type(() => BmlError)
  readonly errors: BmlError[];

  @ValidateNested()
  @Type(() => apiObjects.UdfsDict)
  readonly udfsDict: apiObjects.UdfsDict;

  @ValidateNested()
  @Type(() => View)
  readonly views: View[];

  @ValidateNested()
  @Type(() => apiObjects.Model)
  readonly models: apiObjects.Model[];

  @ValidateNested()
  @Type(() => apiObjects.Dashboard)
  readonly dashboards: apiObjects.Dashboard[];

  @ValidateNested()
  @Type(() => apiObjects.Viz)
  readonly vizs: apiObjects.Viz[];

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
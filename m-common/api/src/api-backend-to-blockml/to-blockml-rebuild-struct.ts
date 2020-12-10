import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../objects/_index';
import * as apiEnums from '../enums/_index';
import { ErrorsPack, Model, ViewsPack } from '../objects/_index';

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
  @Type(() => ErrorsPack)
  errorsPack: ErrorsPack;

  @ValidateNested()
  @Type(() => ViewsPack)
  viewsPack: ViewsPack;
  // TODO: structFull udfsContent --> udfsDict, vizs

  @ValidateNested()
  @Type(() => Model)
  models: Model[];

  // @ValidateNested()
  // @Type(() => Dashboard)
  // dashboards: Dashboard[];

  // @ValidateNested()
  // @Type(() => Mconfig)
  // mconfigs: Mconfig[];

  // @ValidateNested()
  // @Type(() => Query)
  // queries: Query[];
}

export class ToBlockmlRebuildStructResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  readonly payload: ToBlockmlRebuildStructResponsePayload;
}

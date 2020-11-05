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

  //

  @IsEnum(apiEnums.ProjectConnectionEnum)
  readonly connection: apiEnums.ProjectConnectionEnum;

  @IsString()
  readonly bigqueryProject: string;
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
  @Type(() => apiObjects.StructFull)
  readonly struct: apiObjects.StructFull;

  @IsString()
  readonly udfsContent: string;

  // @IsString({ each: true })
  // readonly pdtsSorted: string[];
}

export class ToBlockmlRebuildStructResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToBlockmlRebuildStructResponsePayload)
  readonly payload: ToBlockmlRebuildStructResponsePayload;
}

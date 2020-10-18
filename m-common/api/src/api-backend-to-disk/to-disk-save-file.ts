import * as apiObjects from '../objects/_index';
import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '../enums/_index';

export class ToDiskSaveFileRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly fileAbsoluteId: string;

  @IsString()
  readonly content: string;
}

export class ToDiskSaveFileRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskSaveFileRequestPayload)
  readonly payload: ToDiskSaveFileRequestPayload;
}

export class ToDiskSaveFileResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly currentBranch: string;

  @IsEnum(apiEnums.RepoStatusEnum)
  readonly repoStatus: apiEnums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => apiObjects.FileLine)
  readonly conflicts: apiObjects.FileLine[];
}

export class ToDiskSaveFileResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskSaveFileResponsePayload)
  readonly payload: ToDiskSaveFileResponsePayload;
}

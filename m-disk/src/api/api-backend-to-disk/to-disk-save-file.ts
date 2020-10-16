import * as apiObjects from '../objects/_index';
import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';

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

export class ToDiskSaveFileResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
}

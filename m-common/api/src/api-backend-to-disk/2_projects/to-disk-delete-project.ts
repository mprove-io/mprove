import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../objects/_index';
import * as apiEnums from '../../enums/_index';

export class ToDiskDeleteProjectRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;
}

export class ToDiskDeleteProjectRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskDeleteProjectRequestPayload)
  readonly payload: ToDiskDeleteProjectRequestPayload;
}

export class ToDiskDeleteProjectResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly deletedProjectId: string;
}

export class ToDiskDeleteProjectResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskDeleteProjectResponsePayload)
  readonly payload: ToDiskDeleteProjectResponsePayload;
}

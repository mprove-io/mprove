import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateProjectRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  name: string;

  @IsEnum(common.ProjectRemoteTypeEnum)
  remoteType: common.ProjectRemoteTypeEnum;

  @IsString()
  @IsOptional()
  gitUrl?: string;

  @IsString()
  @IsOptional()
  noteId?: string;
}

export class ToBackendCreateProjectRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateProjectRequestPayload)
  payload: ToBackendCreateProjectRequestPayload;
}

export class ToBackendCreateProjectResponsePayload {
  @ValidateNested()
  @Type(() => common.Project)
  project: common.Project;
}

export class ToBackendCreateProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateProjectResponsePayload)
  payload: ToBackendCreateProjectResponsePayload;
}

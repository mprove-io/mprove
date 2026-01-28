import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectRemoteTypeEnum } from '#common/enums/project-remote-type.enum';
import { Project } from '#common/interfaces/backend/project';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateProjectRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  name: string;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

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
  @Type(() => Project)
  project: Project;
}

export class ToBackendCreateProjectResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateProjectResponsePayload)
  payload: ToBackendCreateProjectResponsePayload;
}

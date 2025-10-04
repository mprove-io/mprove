import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateProjectRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => Project)
  project: Project;

  @IsOptional()
  @IsString()
  testProjectId?: string;

  @IsString()
  devRepoId: string;

  @IsString()
  userAlias: string;
}

export class ToDiskCreateProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateProjectRequestPayload)
  payload: ToDiskCreateProjectRequestPayload;
}

export class ToDiskCreateProjectResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  defaultBranch: string;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  prodFiles: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskCreateProjectResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateProjectResponsePayload)
  payload: ToDiskCreateProjectResponsePayload;
}

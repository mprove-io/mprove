import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskSeedProjectRequestPayload {
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

export class ToDiskSeedProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectRequestPayload)
  payload: ToDiskSeedProjectRequestPayload;
}

export class ToDiskSeedProjectResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskSeedProjectResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectResponsePayload)
  payload: ToDiskSeedProjectResponsePayload;
}

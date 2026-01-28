import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '#common/interfaces/backend/base-project';
import { DiskCatalogFile } from '#common/interfaces/disk/disk-catalog-file';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskPushRepoRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => BaseProject)
  baseProject: BaseProject;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  userAlias: string;
}

export class ToDiskPushRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskPushRepoRequestPayload)
  payload: ToDiskPushRepoRequestPayload;
}

export class ToDiskPushRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  productionFiles: DiskCatalogFile[];

  @IsString()
  productionMproveDir: string;
}

export class ToDiskPushRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskPushRepoResponsePayload)
  payload: ToDiskPushRepoResponsePayload;
}

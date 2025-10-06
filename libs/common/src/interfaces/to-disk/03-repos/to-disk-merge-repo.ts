import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskMergeRepoRequestPayload {
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
  theirBranch: string;

  @IsBoolean()
  isTheirBranchRemote: boolean;

  @IsString()
  userAlias: string;
}

export class ToDiskMergeRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskMergeRepoRequestPayload)
  payload: ToDiskMergeRepoRequestPayload;
}

export class ToDiskMergeRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskMergeRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskMergeRepoResponsePayload)
  payload: ToDiskMergeRepoResponsePayload;
}

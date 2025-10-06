import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateBranchRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => BaseProject)
  baseProject: BaseProject;

  @IsString()
  repoId: string;

  @IsString()
  newBranch: string;

  @IsString()
  fromBranch: string;

  @IsBoolean()
  isFromRemote: boolean;
}

export class ToDiskCreateBranchRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchRequestPayload)
  payload: ToDiskCreateBranchRequestPayload;
}

export class ToDiskCreateBranchResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskCreateBranchResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateBranchResponsePayload)
  payload: ToDiskCreateBranchResponsePayload;
}

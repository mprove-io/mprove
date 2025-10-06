import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskRevertRepoToRemoteRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => BaseProject)
  baseProject: BaseProject;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;
}

export class ToDiskRevertRepoToRemoteRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToRemoteRequestPayload)
  payload: ToDiskRevertRepoToRemoteRequestPayload;
}

export class ToDiskRevertRepoToRemoteResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskRevertRepoToRemoteResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRevertRepoToRemoteResponsePayload)
  payload: ToDiskRevertRepoToRemoteResponsePayload;
}

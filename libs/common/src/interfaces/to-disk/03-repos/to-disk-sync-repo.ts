import { Type } from 'class-transformer';
import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { DiskSyncFile } from '~common/interfaces/disk/disk-sync-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskSyncRepoRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => Project)
  project: Project;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  lastCommit: string;

  @IsNumber()
  lastSyncTime: number;

  @ValidateNested()
  @Type(() => DiskSyncFile)
  localChangedFiles: DiskSyncFile[];

  @ValidateNested()
  @Type(() => DiskSyncFile)
  localDeletedFiles: DiskSyncFile[];
}

export class ToDiskSyncRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSyncRepoRequestPayload)
  payload: ToDiskSyncRepoRequestPayload;
}

export class ToDiskSyncRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @ValidateNested()
  @Type(() => DiskSyncFile)
  restChangedFiles: DiskSyncFile[];

  @ValidateNested()
  @Type(() => DiskSyncFile)
  restDeletedFiles: DiskSyncFile[];

  @IsString()
  mproveDir: string;

  @IsNumber()
  devReqReceiveTime: number;

  @IsNumber()
  devRespSentTime: number;
}

export class ToDiskSyncRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSyncRepoResponsePayload)
  payload: ToDiskSyncRepoResponsePayload;
}

import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { DiskSyncFile } from '~common/interfaces/disk/disk-sync-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskSyncRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

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

  @IsString()
  userAlias: string;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

  @IsString()
  @IsOptional()
  gitUrl?: string;

  @IsString()
  @IsOptional()
  privateKey?: string;

  @IsString()
  @IsOptional()
  publicKey?: string;
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

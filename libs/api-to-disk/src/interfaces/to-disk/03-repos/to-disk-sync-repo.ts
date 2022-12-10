import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

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
  @Type(() => common.DiskSyncFile)
  localChangedFiles: common.DiskSyncFile[];

  @ValidateNested()
  @Type(() => common.DiskSyncFile)
  localDeletedFiles: common.DiskSyncFile[];

  @IsString()
  userAlias: string;

  @IsEnum(common.ProjectRemoteTypeEnum)
  remoteType: common.ProjectRemoteTypeEnum;

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
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];

  @ValidateNested()
  @Type(() => common.DiskSyncFile)
  restChangedFiles: common.DiskSyncFile[];

  @ValidateNested()
  @Type(() => common.DiskSyncFile)
  restDeletedFiles: common.DiskSyncFile[];

  @IsString()
  mproveDir: string;

  @IsNumber()
  currentTime: number;
}

export class ToDiskSyncRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSyncRepoResponsePayload)
  payload: ToDiskSyncRepoResponsePayload;
}

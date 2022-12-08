import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
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

  @ValidateNested()
  @Type(() => common.DiskFileSync)
  changedFiles: common.DiskFileSync[];

  @ValidateNested()
  @Type(() => common.DiskFileSync)
  deletedFiles: common.DiskFileSync[];

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
  @Type(() => common.DiskFileSync)
  restChangedFiles: common.DiskFileSync[];

  @ValidateNested()
  @Type(() => common.DiskFileSync)
  restDeletedFiles: common.DiskFileSync[];

  @IsString()
  mproveDir: string;
}

export class ToDiskSyncRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSyncRepoResponsePayload)
  payload: ToDiskSyncRepoResponsePayload;
}

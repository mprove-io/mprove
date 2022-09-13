import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskPullRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

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

export class ToDiskPullRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskPullRepoRequestPayload)
  payload: ToDiskPullRepoRequestPayload;
}

export class ToDiskPullRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskPullRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskPullRepoResponsePayload)
  payload: ToDiskPullRepoResponsePayload;
}

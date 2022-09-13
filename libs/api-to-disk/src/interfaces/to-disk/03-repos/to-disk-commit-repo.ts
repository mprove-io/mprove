import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCommitRepoRequestPayload {
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

  @IsString()
  commitMessage: string;

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

export class ToDiskCommitRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCommitRepoRequestPayload)
  payload: ToDiskCommitRepoRequestPayload;
}

export class ToDiskCommitRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskCommitRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCommitRepoResponsePayload)
  payload: ToDiskCommitRepoResponsePayload;
}

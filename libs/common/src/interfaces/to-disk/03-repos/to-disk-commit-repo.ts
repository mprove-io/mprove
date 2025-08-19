import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

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

export class ToDiskCommitRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCommitRepoRequestPayload)
  payload: ToDiskCommitRepoRequestPayload;
}

export class ToDiskCommitRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;
}

export class ToDiskCommitRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCommitRepoResponsePayload)
  payload: ToDiskCommitRepoResponsePayload;
}

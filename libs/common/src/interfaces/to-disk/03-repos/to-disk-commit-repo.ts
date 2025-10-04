import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCommitRepoRequestPayload {
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
  userAlias: string;

  @IsString()
  commitMessage: string;
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

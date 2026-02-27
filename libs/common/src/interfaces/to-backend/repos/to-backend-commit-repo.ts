import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCommitRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  repoId: string;

  @IsString()
  commitMessage: string;
}

export class ToBackendCommitRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCommitRepoRequestPayload)
  payload: ToBackendCommitRepoRequestPayload;
}

export class ToBackendCommitRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;
}

export class ToBackendCommitRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCommitRepoResponsePayload)
  payload: ToBackendCommitRepoResponsePayload;
}

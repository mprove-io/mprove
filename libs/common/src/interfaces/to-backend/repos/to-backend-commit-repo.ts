import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import type { SessionApi } from '#common/interfaces/backend/session-api';
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

  @IsOptional()
  session?: SessionApi;
}

export class ToBackendCommitRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCommitRepoResponsePayload)
  payload: ToBackendCommitRepoResponsePayload;
}

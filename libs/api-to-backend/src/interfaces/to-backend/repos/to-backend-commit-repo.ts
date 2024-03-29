import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCommitRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsBoolean()
  isRepoProd: boolean;

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
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendCommitRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCommitRepoResponsePayload)
  payload: ToBackendCommitRepoResponsePayload;
}

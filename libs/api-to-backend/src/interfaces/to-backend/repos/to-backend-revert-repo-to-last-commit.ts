import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRevertRepoToLastCommitRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendRevertRepoToLastCommitRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToLastCommitRequestPayload)
  payload: ToBackendRevertRepoToLastCommitRequestPayload;
}

export class ToBackendRevertRepoToLastCommitResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendRevertRepoToLastCommitResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToLastCommitResponsePayload)
  payload: ToBackendRevertRepoToLastCommitResponsePayload;
}

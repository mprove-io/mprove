import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendMergeRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  theirBranchId: string;

  @IsBoolean()
  isTheirBranchRemote: boolean;
}

export class ToBackendMergeRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendMergeRepoRequestPayload)
  payload: ToBackendMergeRepoRequestPayload;
}

export class ToBackendMergeRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendMergeRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendMergeRepoResponsePayload)
  payload: ToBackendMergeRepoResponsePayload;
}

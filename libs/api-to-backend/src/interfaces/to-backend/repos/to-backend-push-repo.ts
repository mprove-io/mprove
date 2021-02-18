import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendPushRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendPushRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendPushRepoRequestPayload)
  payload: ToBackendPushRepoRequestPayload;
}

export class ToBackendPushRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendPushRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendPushRepoResponsePayload)
  payload: ToBackendPushRepoResponsePayload;
}
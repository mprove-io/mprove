import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendGetRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendGetRepoRequestPayload)
  payload: ToBackendGetRepoRequestPayload;
}

export class ToBackendGetRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendGetRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetRepoResponsePayload)
  payload: ToBackendGetRepoResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendPullRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendPullRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendPullRepoRequestPayload)
  payload: ToBackendPullRepoRequestPayload;
}

export class ToBackendPullRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;
}

export class ToBackendPullRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendPullRepoResponsePayload)
  payload: ToBackendPullRepoResponsePayload;
}

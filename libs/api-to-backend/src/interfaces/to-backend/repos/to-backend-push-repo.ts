import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendPushRepoRequestPayload {
  @IsString()
  projectId: string;

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

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;
}

export class ToBackendPushRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendPushRepoResponsePayload)
  payload: ToBackendPushRepoResponsePayload;
}

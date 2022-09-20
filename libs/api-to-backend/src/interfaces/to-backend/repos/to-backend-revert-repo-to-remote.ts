import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRevertRepoToRemoteRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendRevertRepoToRemoteRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToRemoteRequestPayload)
  payload: ToBackendRevertRepoToRemoteRequestPayload;
}

export class ToBackendRevertRepoToRemoteResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;
}

export class ToBackendRevertRepoToRemoteResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToRemoteResponsePayload)
  payload: ToBackendRevertRepoToRemoteResponsePayload;
}

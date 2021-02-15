import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRevertRepoToProductionRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branchId: string;
}

export class ToBackendRevertRepoToProductionRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToProductionRequestPayload)
  payload: ToBackendRevertRepoToProductionRequestPayload;
}

export class ToBackendRevertRepoToProductionResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendRevertRepoToProductionResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToProductionResponsePayload)
  payload: ToBackendRevertRepoToProductionResponsePayload;
}

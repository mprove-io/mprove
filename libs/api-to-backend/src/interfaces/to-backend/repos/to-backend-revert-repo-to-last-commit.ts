import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendRevertRepoToLastCommitRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
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

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendRevertRepoToLastCommitResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToLastCommitResponsePayload)
  payload: ToBackendRevertRepoToLastCommitResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { Struct } from '~common/interfaces/backend/struct';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRevertRepoToLastCommitRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

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
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => Struct)
  struct: Struct;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendRevertRepoToLastCommitResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToLastCommitResponsePayload)
  payload: ToBackendRevertRepoToLastCommitResponsePayload;
}

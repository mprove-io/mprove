import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '#common/interfaces/backend/struct-x';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendRevertRepoToRemoteRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

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
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendRevertRepoToRemoteResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendRevertRepoToRemoteResponsePayload)
  payload: ToBackendRevertRepoToRemoteResponsePayload;
}

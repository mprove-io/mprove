import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '#common/interfaces/backend/struct-x';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendPullRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

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
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendPullRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendPullRepoResponsePayload)
  payload: ToBackendPullRepoResponsePayload;
}

import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '#common/interfaces/backend/struct-x';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendMergeRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  theirBranchId: string;
}

export class ToBackendMergeRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendMergeRepoRequestPayload)
  payload: ToBackendMergeRepoRequestPayload;
}

export class ToBackendMergeRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendMergeRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendMergeRepoResponsePayload)
  payload: ToBackendMergeRepoResponsePayload;
}

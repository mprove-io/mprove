import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendGetRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
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

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;
}

export class ToBackendGetRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendGetRepoResponsePayload)
  payload: ToBackendGetRepoResponsePayload;
}

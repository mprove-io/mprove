import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '~common/interfaces/backend/struct-x';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendPushRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsBoolean()
  isRepoProd: boolean;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;
}

export class ToBackendPushRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendPushRepoRequestPayload)
  payload: ToBackendPushRepoRequestPayload;
}

export class ToBackendPushRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendPushRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendPushRepoResponsePayload)
  payload: ToBackendPushRepoResponsePayload;
}

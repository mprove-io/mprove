import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendSyncRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  lastCommit: string;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => common.DiskFileSync)
  changedFiles: common.DiskFileSync[];

  @ValidateNested()
  @Type(() => common.DiskFileSync)
  deletedFiles: common.DiskFileSync[];
}

export class ToBackendSyncRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSyncRepoRequestPayload)
  payload: ToBackendSyncRepoRequestPayload;
}

export class ToBackendSyncRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.DiskFileSync)
  restChangedFiles: common.DiskFileSync[];

  @ValidateNested()
  @Type(() => common.DiskFileSync)
  restDeletedFiles: common.DiskFileSync[];

  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => common.Struct)
  struct: common.Struct;
}

export class ToBackendSyncRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSyncRepoResponsePayload)
  payload: ToBackendSyncRepoResponsePayload;
}

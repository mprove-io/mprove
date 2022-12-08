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
  @Type(() => common.DiskSyncFile)
  localChangedFiles: common.DiskSyncFile[];

  @ValidateNested()
  @Type(() => common.DiskSyncFile)
  localDeletedFiles: common.DiskSyncFile[];
}

export class ToBackendSyncRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSyncRepoRequestPayload)
  payload: ToBackendSyncRepoRequestPayload;
}

export class ToBackendSyncRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.DiskSyncFile)
  restChangedFiles: common.DiskSyncFile[];

  @ValidateNested()
  @Type(() => common.DiskSyncFile)
  restDeletedFiles: common.DiskSyncFile[];

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

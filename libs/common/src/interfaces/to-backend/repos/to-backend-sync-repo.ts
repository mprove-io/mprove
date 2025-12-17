import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';
import { StructX } from '~common/interfaces/backend/struct-x';
import { DiskSyncFile } from '~common/interfaces/disk/disk-sync-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendSyncRepoRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  lastCommit: string;

  @IsNumber()
  lastSyncTime: number;

  @IsString()
  envId: string;

  @ValidateNested()
  @Type(() => DiskSyncFile)
  localChangedFiles: DiskSyncFile[];

  @ValidateNested()
  @Type(() => DiskSyncFile)
  localDeletedFiles: DiskSyncFile[];
}

export class ToBackendSyncRepoRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendSyncRepoRequestPayload)
  payload: ToBackendSyncRepoRequestPayload;
}

export class ToBackendSyncRepoResponsePayload {
  @ValidateNested()
  @Type(() => DiskSyncFile)
  restChangedFiles: DiskSyncFile[];

  @ValidateNested()
  @Type(() => DiskSyncFile)
  restDeletedFiles: DiskSyncFile[];

  @IsBoolean()
  needValidate: boolean;

  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsNumber()
  devReqReceiveTime: number;

  @IsNumber()
  devRespSentTime: number;
}

export class ToBackendSyncRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendSyncRepoResponsePayload)
  payload: ToBackendSyncRepoResponsePayload;
}

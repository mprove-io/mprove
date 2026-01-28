import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '#common/interfaces/backend/struct-x';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendDeleteFolderRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

  @IsString()
  folderNodeId: string;
}

export class ToBackendDeleteFolderRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendDeleteFolderRequestPayload)
  payload: ToBackendDeleteFolderRequestPayload;
}

export class ToBackendDeleteFolderResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendDeleteFolderResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteFolderResponsePayload)
  payload: ToBackendDeleteFolderResponsePayload;
}

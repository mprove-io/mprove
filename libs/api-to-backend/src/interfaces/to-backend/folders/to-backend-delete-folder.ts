import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

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
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.Repo)
  struct: common.Struct;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendDeleteFolderResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendDeleteFolderResponsePayload)
  payload: ToBackendDeleteFolderResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-backend/barrels/common';
import { ToBackendRequest } from '~api-to-backend/interfaces/to-backend/to-backend-request';

export class ToBackendCreateFolderRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  parentNodeId: string;

  @IsString()
  folderName: string;
}

export class ToBackendCreateFolderRequest extends ToBackendRequest {
  @ValidateNested()
  @Type(() => ToBackendCreateFolderRequestPayload)
  payload: ToBackendCreateFolderRequestPayload;
}

export class ToBackendCreateFolderResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToBackendCreateFolderResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateFolderResponsePayload)
  payload: ToBackendCreateFolderResponsePayload;
}

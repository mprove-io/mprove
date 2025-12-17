import { Type } from 'class-transformer';
import { IsBoolean, IsString, ValidateNested } from 'class-validator';
import { StructX } from '~common/interfaces/backend/struct-x';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToBackendRequest } from '../to-backend-request';

export class ToBackendCreateFolderRequestPayload {
  @IsString()
  projectId: string;

  @IsString()
  branchId: string;

  @IsString()
  envId: string;

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
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => StructX)
  struct: StructX;

  @IsBoolean()
  needValidate: boolean;
}

export class ToBackendCreateFolderResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToBackendCreateFolderResponsePayload)
  payload: ToBackendCreateFolderResponsePayload;
}

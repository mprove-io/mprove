import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteFolderRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  folderNodeId: string;
}

export class ToDiskDeleteFolderRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteFolderRequestPayload)
  payload: ToDiskDeleteFolderRequestPayload;
}

export class ToDiskDeleteFolderResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @IsString()
  deletedFolderNodeId: string;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskDeleteFolderResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFolderResponsePayload)
  payload: ToDiskDeleteFolderResponsePayload;
}

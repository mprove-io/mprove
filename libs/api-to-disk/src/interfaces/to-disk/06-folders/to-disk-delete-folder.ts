import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
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
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  currentBranch: string;

  @IsString()
  deletedFolderNodeId: string;

  @IsEnum(enums.RepoStatusEnum)
  repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  conflicts: common.DiskFileLine[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  nodes: Array<DiskCatalogNode>;
}

export class ToDiskDeleteFolderResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFolderResponsePayload)
  payload: ToDiskDeleteFolderResponsePayload;
}

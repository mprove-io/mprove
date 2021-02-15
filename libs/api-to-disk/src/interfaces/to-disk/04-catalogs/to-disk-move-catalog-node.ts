import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskMoveCatalogNodeRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  fromNodeId: string;

  @IsString()
  toNodeId: string;
}

export class ToDiskMoveCatalogNodeRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeRequestPayload)
  payload: ToDiskMoveCatalogNodeRequestPayload;
}

export class ToDiskMoveCatalogNodeResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  currentBranch: string;

  @IsEnum(common.RepoStatusEnum)
  repoStatus: common.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  conflicts: common.DiskFileLine[];

  @ValidateNested()
  @Type(() => common.DiskCatalogNode)
  nodes: Array<common.DiskCatalogNode>;
}

export class ToDiskMoveCatalogNodeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeResponsePayload)
  payload: ToDiskMoveCatalogNodeResponsePayload;
}

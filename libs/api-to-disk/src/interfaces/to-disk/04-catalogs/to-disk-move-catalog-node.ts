import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskMoveCatalogNodeRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly fromNodeId: string;

  @IsString()
  readonly toNodeId: string;
}

export class ToDiskMoveCatalogNodeRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeRequestPayload)
  readonly payload: ToDiskMoveCatalogNodeRequestPayload;
}

export class ToDiskMoveCatalogNodeResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  readonly repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  readonly conflicts: common.DiskFileLine[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  readonly nodes: Array<DiskCatalogNode>;
}

export class ToDiskMoveCatalogNodeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeResponsePayload)
  readonly payload: ToDiskMoveCatalogNodeResponsePayload;
}

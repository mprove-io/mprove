import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskRenameCatalogNodeRequestPayload {
  @IsString()
  readonly orgId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly nodeId: string;

  @IsString()
  readonly newName: string;
}

export class ToDiskRenameCatalogNodeRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskRenameCatalogNodeRequestPayload)
  readonly payload: ToDiskRenameCatalogNodeRequestPayload;
}

export class ToDiskRenameCatalogNodeResponsePayload {
  @IsString()
  readonly orgId: string;

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

export class ToDiskRenameCatalogNodeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRenameCatalogNodeResponsePayload)
  readonly payload: ToDiskRenameCatalogNodeResponsePayload;
}

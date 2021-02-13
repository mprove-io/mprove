import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskGetCatalogNodesRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsOptional()
  @IsString()
  branch?: string;
}

export class ToDiskGetCatalogNodesRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesRequestPayload)
  payload: ToDiskGetCatalogNodesRequestPayload;
}

export class ToDiskGetCatalogNodesResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  currentBranch: string;

  @IsEnum(enums.RepoStatusEnum)
  repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  conflicts: common.DiskFileLine[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  nodes: Array<DiskCatalogNode>;
}

export class ToDiskGetCatalogNodesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesResponsePayload)
  payload: ToDiskGetCatalogNodesResponsePayload;
}

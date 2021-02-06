import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskGetCatalogNodesRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsOptional()
  @IsString()
  readonly branch?: string;
}

export class ToDiskGetCatalogNodesRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesRequestPayload)
  readonly payload: ToDiskGetCatalogNodesRequestPayload;
}

export class ToDiskGetCatalogNodesResponsePayload {
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

export class ToDiskGetCatalogNodesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesResponsePayload)
  readonly payload: ToDiskGetCatalogNodesResponsePayload;
}

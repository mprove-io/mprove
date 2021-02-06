import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateFileRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly parentNodeId: string;

  @IsString()
  readonly fileName: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskCreateFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateFileRequestPayload)
  readonly payload: ToDiskCreateFileRequestPayload;
}

export class ToDiskCreateFileResponsePayload {
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

export class ToDiskCreateFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateFileResponsePayload)
  readonly payload: ToDiskCreateFileResponsePayload;
}

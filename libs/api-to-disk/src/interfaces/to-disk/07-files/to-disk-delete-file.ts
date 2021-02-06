import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteFileRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly fileNodeId: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskDeleteFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileRequestPayload)
  readonly payload: ToDiskDeleteFileRequestPayload;
}

export class ToDiskDeleteFileResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly currentBranch: string;

  @IsString()
  readonly deletedFileNodeId: string;

  @IsEnum(enums.RepoStatusEnum)
  readonly repoStatus: enums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => common.DiskFileLine)
  readonly conflicts: common.DiskFileLine[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  readonly nodes: Array<DiskCatalogNode>;
}

export class ToDiskDeleteFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileResponsePayload)
  readonly payload: ToDiskDeleteFileResponsePayload;
}

import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogNode } from '~api-to-disk/interfaces/ints/disk-catalog-node';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateFileRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  parentNodeId: string;

  @IsString()
  fileName: string;

  @IsString()
  userAlias: string;
}

export class ToDiskCreateFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateFileRequestPayload)
  payload: ToDiskCreateFileRequestPayload;
}

export class ToDiskCreateFileResponsePayload {
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

export class ToDiskCreateFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateFileResponsePayload)
  payload: ToDiskCreateFileResponsePayload;
}

import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import {
  DiskCatalogFile,
  DiskCatalogNode
} from '~api-to-disk/interfaces/ints/_index';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskSeedProjectRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  devRepoId: string;

  @IsString()
  userAlias: string;
}

export class ToDiskSeedProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectRequestPayload)
  payload: ToDiskSeedProjectRequestPayload;
}

export class ToDiskSeedProjectResponsePayload {
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
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  nodes: Array<DiskCatalogNode>;
}

export class ToDiskSeedProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectResponsePayload)
  payload: ToDiskSeedProjectResponsePayload;
}

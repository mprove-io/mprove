import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import {
  DiskCatalogFile,
  DiskCatalogNode
} from '~api-to-disk/interfaces/ints/_index';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskSeedProjectRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly devRepoId: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskSeedProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectRequestPayload)
  readonly payload: ToDiskSeedProjectRequestPayload;
}

export class ToDiskSeedProjectResponsePayload {
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
  @Type(() => DiskCatalogFile)
  readonly files: DiskCatalogFile[];

  @ValidateNested()
  @Type(() => DiskCatalogNode)
  readonly nodes: Array<DiskCatalogNode>;
}

export class ToDiskSeedProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectResponsePayload)
  readonly payload: ToDiskSeedProjectResponsePayload;
}

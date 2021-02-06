import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogFile } from '~api-to-disk/interfaces/ints/disk-catalog-file';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskGetCatalogFilesRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskGetCatalogFilesRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesRequestPayload)
  readonly payload: ToDiskGetCatalogFilesRequestPayload;
}

export class ToDiskGetCatalogFilesResponsePayload {
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
}

export class ToDiskGetCatalogFilesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesResponsePayload)
  readonly payload: ToDiskGetCatalogFilesResponsePayload;
}

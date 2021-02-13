import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { enums } from '~api-to-disk/barrels/enums';
import { DiskCatalogFile } from '~api-to-disk/interfaces/ints/disk-catalog-file';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskGetCatalogFilesRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;
}

export class ToDiskGetCatalogFilesRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesRequestPayload)
  payload: ToDiskGetCatalogFilesRequestPayload;
}

export class ToDiskGetCatalogFilesResponsePayload {
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
}

export class ToDiskGetCatalogFilesResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesResponsePayload)
  payload: ToDiskGetCatalogFilesResponsePayload;
}

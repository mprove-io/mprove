import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskGetCatalogFilesRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => Project)
  project: Project;

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
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskGetCatalogFilesResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesResponsePayload)
  payload: ToDiskGetCatalogFilesResponsePayload;
}

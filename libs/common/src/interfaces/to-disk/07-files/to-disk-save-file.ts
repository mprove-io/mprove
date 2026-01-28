import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '#common/interfaces/backend/base-project';
import { DiskCatalogFile } from '#common/interfaces/disk/disk-catalog-file';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskSaveFileRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => BaseProject)
  baseProject: BaseProject;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  fileNodeId: string;

  @IsString()
  content: string;

  @IsString()
  userAlias: string;
}

export class ToDiskSaveFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSaveFileRequestPayload)
  payload: ToDiskSaveFileRequestPayload;
}

export class ToDiskSaveFileResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskSaveFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSaveFileResponsePayload)
  payload: ToDiskSaveFileResponsePayload;
}

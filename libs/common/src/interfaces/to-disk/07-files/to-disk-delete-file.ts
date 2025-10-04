import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskDeleteFileRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => Project)
  project: Project;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  fileNodeId: string;

  @IsString()
  userAlias: string;

  // @IsOptional()
  // @IsString()
  // secondFileNodeId?: string;
}

export class ToDiskDeleteFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileRequestPayload)
  payload: ToDiskDeleteFileRequestPayload;
}

export class ToDiskDeleteFileResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @IsString()
  deletedFileNodeId: string;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskDeleteFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileResponsePayload)
  payload: ToDiskDeleteFileResponsePayload;
}

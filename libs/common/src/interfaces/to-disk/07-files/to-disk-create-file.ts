import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateFileRequestPayload {
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
  userAlias: string;

  @IsString()
  parentNodeId: string;

  @IsString()
  fileName: string;

  @IsOptional()
  @IsString()
  fileText?: string;

  // @IsOptional()
  // @IsString()
  // secondFileName?: string;

  // @IsOptional()
  // @IsString()
  // secondFileText?: string;
}

export class ToDiskCreateFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateFileRequestPayload)
  payload: ToDiskCreateFileRequestPayload;
}

export class ToDiskCreateFileResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskCreateFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateFileResponsePayload)
  payload: ToDiskCreateFileResponsePayload;
}

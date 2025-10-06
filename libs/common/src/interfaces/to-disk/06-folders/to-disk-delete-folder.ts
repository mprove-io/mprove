import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskDeleteFolderRequestPayload {
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
  folderNodeId: string;
}

export class ToDiskDeleteFolderRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteFolderRequestPayload)
  payload: ToDiskDeleteFolderRequestPayload;
}

export class ToDiskDeleteFolderResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @IsString()
  deletedFolderNodeId: string;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskDeleteFolderResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFolderResponsePayload)
  payload: ToDiskDeleteFolderResponsePayload;
}

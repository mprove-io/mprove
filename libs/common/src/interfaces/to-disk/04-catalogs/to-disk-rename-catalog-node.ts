import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskRenameCatalogNodeRequestPayload {
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
  nodeId: string;

  @IsString()
  newName: string;
}

export class ToDiskRenameCatalogNodeRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskRenameCatalogNodeRequestPayload)
  payload: ToDiskRenameCatalogNodeRequestPayload;
}

export class ToDiskRenameCatalogNodeResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskRenameCatalogNodeResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRenameCatalogNodeResponsePayload)
  payload: ToDiskRenameCatalogNodeResponsePayload;
}

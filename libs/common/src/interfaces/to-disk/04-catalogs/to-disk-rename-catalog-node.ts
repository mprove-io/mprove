import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskRenameCatalogNodeRequestPayload {
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

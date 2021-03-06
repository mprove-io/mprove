import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskRenameCatalogNodeRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

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
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskRenameCatalogNodeResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskRenameCatalogNodeResponsePayload)
  payload: ToDiskRenameCatalogNodeResponsePayload;
}

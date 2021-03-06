import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskSaveFileRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

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
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskSaveFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSaveFileResponsePayload)
  payload: ToDiskSaveFileResponsePayload;
}

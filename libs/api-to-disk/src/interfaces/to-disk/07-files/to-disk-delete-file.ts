import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteFileRequestPayload {
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
  userAlias: string;
}

export class ToDiskDeleteFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileRequestPayload)
  payload: ToDiskDeleteFileRequestPayload;
}

export class ToDiskDeleteFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @IsString()
  deletedFileNodeId: string;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskDeleteFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileResponsePayload)
  payload: ToDiskDeleteFileResponsePayload;
}

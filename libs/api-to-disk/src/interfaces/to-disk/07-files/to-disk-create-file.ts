import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateFileRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  parentNodeId: string;

  @IsString()
  fileName: string;

  @IsString()
  userAlias: string;

  @IsOptional()
  @IsString()
  fileText?: string;
}

export class ToDiskCreateFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateFileRequestPayload)
  payload: ToDiskCreateFileRequestPayload;
}

export class ToDiskCreateFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskCreateFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateFileResponsePayload)
  payload: ToDiskCreateFileResponsePayload;
}

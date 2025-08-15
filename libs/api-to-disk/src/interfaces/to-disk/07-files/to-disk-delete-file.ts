import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
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

  // @IsOptional()
  // @IsString()
  // secondFileNodeId?: string;

  @IsString()
  userAlias: string;

  @IsEnum(common.ProjectRemoteTypeEnum)
  remoteType: common.ProjectRemoteTypeEnum;

  @IsString()
  @IsOptional()
  gitUrl?: string;

  @IsString()
  @IsOptional()
  privateKey?: string;

  @IsString()
  @IsOptional()
  publicKey?: string;
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

  @IsString()
  mproveDir: string;
}

export class ToDiskDeleteFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFileResponsePayload)
  payload: ToDiskDeleteFileResponsePayload;
}

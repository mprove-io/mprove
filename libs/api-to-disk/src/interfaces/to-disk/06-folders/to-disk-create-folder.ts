import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateFolderRequestPayload {
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
  folderName: string;

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

export class ToDiskCreateFolderRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateFolderRequestPayload)
  payload: ToDiskCreateFolderRequestPayload;
}

export class ToDiskCreateFolderResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskCreateFolderResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateFolderResponsePayload)
  payload: ToDiskCreateFolderResponsePayload;
}

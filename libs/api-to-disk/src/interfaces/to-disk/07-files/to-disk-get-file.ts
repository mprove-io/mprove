import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskGetFileRequestPayload {
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

  @IsEnum(common.PanelEnum)
  panel: common.PanelEnum;

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

export class ToDiskGetFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskGetFileRequestPayload)
  payload: ToDiskGetFileRequestPayload;
}

export class ToDiskGetFileResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @IsString()
  originalContent: string;

  @IsString()
  content: string;

  @IsBoolean()
  isExist: boolean;
}

export class ToDiskGetFileResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetFileResponsePayload)
  payload: ToDiskGetFileResponsePayload;
}

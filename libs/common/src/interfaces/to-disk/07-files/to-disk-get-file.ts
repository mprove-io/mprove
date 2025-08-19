import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested
} from 'class-validator';
import { PanelEnum } from '~common/enums/panel.enum';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

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

  @IsEnum(PanelEnum)
  panel: PanelEnum;

  @IsEnum(ProjectRemoteTypeEnum)
  remoteType: ProjectRemoteTypeEnum;

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
  @Type(() => Repo)
  repo: Repo;

  @IsString()
  originalContent: string;

  @IsString()
  content: string;

  @IsBoolean()
  isExist: boolean;
}

export class ToDiskGetFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskGetFileResponsePayload)
  payload: ToDiskGetFileResponsePayload;
}

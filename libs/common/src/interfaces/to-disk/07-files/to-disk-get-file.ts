import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import { BuilderLeftEnum } from '#common/enums/builder-left.enum';
import { BaseProject } from '#common/interfaces/backend/base-project';
import { Repo } from '#common/interfaces/disk/repo';
import { MyResponse } from '#common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskGetFileRequestPayload {
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
  fileNodeId: string;

  @IsEnum(BuilderLeftEnum)
  builderLeft: BuilderLeftEnum;
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

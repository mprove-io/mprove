import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

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

  // @IsOptional()
  // @IsString()
  // secondFileNodeId?: string;

  // @IsOptional()
  // @IsString()
  // secondFileContent?: string;

  // @IsOptional()
  // @IsBoolean()
  // isDeleteSecondFile?: boolean;

  @IsString()
  userAlias: string;

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

export class ToDiskSaveFileRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSaveFileRequestPayload)
  payload: ToDiskSaveFileRequestPayload;
}

export class ToDiskSaveFileResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskSaveFileResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSaveFileResponsePayload)
  payload: ToDiskSaveFileResponsePayload;
}

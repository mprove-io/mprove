import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateProjectRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  projectName: string;

  @IsOptional()
  @IsString()
  testProjectId?: string;

  @IsString()
  devRepoId: string;

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

export class ToDiskCreateProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateProjectRequestPayload)
  payload: ToDiskCreateProjectRequestPayload;
}

export class ToDiskCreateProjectResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  defaultBranch: string;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  prodFiles: common.DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskCreateProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateProjectResponsePayload)
  payload: ToDiskCreateProjectResponsePayload;
}

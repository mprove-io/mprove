import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskSeedProjectRequestPayload {
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

  @IsString()
  defaultBranch: string;

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

export class ToDiskSeedProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectRequestPayload)
  payload: ToDiskSeedProjectRequestPayload;
}

export class ToDiskSeedProjectResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskSeedProjectResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectResponsePayload)
  payload: ToDiskSeedProjectResponsePayload;
}

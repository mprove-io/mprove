import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskPushRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

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

export class ToDiskPushRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskPushRepoRequestPayload)
  payload: ToDiskPushRepoRequestPayload;
}

export class ToDiskPushRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  productionFiles: DiskCatalogFile[];

  @IsString()
  productionMproveDir: string;
}

export class ToDiskPushRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskPushRepoResponsePayload)
  payload: ToDiskPushRepoResponsePayload;
}

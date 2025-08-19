import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ProjectRemoteTypeEnum } from '~common/enums/project-remote-type.enum';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskDeleteFolderRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  repoId: string;

  @IsString()
  branch: string;

  @IsString()
  folderNodeId: string;

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

export class ToDiskDeleteFolderRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteFolderRequestPayload)
  payload: ToDiskDeleteFolderRequestPayload;
}

export class ToDiskDeleteFolderResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @IsString()
  deletedFolderNodeId: string;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskDeleteFolderResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteFolderResponsePayload)
  payload: ToDiskDeleteFolderResponsePayload;
}

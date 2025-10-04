import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { Project } from '~common/interfaces/backend/project';
import { DiskCatalogFile } from '~common/interfaces/disk/disk-catalog-file';
import { Repo } from '~common/interfaces/disk/repo';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateDevRepoRequestPayload {
  @IsString()
  orgId: string;

  @ValidateNested()
  @Type(() => Project)
  project: Project;

  @IsString()
  devRepoId: string;
}

export class ToDiskCreateDevRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateDevRepoRequestPayload)
  payload: ToDiskCreateDevRepoRequestPayload;
}

export class ToDiskCreateDevRepoResponsePayload {
  @ValidateNested()
  @Type(() => Repo)
  repo: Repo;

  @ValidateNested()
  @Type(() => DiskCatalogFile)
  files: DiskCatalogFile[];

  @IsString()
  mproveDir: string;
}

export class ToDiskCreateDevRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateDevRepoResponsePayload)
  payload: ToDiskCreateDevRepoResponsePayload;
}

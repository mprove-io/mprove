import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskSeedProjectRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  devRepoId: string;

  @IsString()
  userAlias: string;
}

export class ToDiskSeedProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectRequestPayload)
  payload: ToDiskSeedProjectRequestPayload;
}

export class ToDiskSeedProjectResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  files: common.DiskCatalogFile[];
}

export class ToDiskSeedProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskSeedProjectResponsePayload)
  payload: ToDiskSeedProjectResponsePayload;
}

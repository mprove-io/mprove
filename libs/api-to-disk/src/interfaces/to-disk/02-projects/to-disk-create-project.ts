import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateProjectRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  devRepoId: string;

  @IsString()
  userAlias: string;
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

  @ValidateNested()
  @Type(() => common.DiskCatalogFile)
  prodFiles: common.DiskCatalogFile[];
}

export class ToDiskCreateProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateProjectResponsePayload)
  payload: ToDiskCreateProjectResponsePayload;
}

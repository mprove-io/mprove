import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

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
}

export class ToDiskPushRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskPushRepoRequestPayload)
  payload: ToDiskPushRepoRequestPayload;
}

export class ToDiskPushRepoResponsePayload {
  @ValidateNested()
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskPushRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskPushRepoResponsePayload)
  payload: ToDiskPushRepoResponsePayload;
}

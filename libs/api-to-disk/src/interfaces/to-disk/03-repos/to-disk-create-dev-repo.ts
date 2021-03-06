import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskCreateDevRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

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
  @Type(() => common.Repo)
  repo: common.Repo;
}

export class ToDiskCreateDevRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateDevRepoResponsePayload)
  payload: ToDiskCreateDevRepoResponsePayload;
}

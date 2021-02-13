import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteDevRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  devRepoId: string;
}

export class ToDiskDeleteDevRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoRequestPayload)
  payload: ToDiskDeleteDevRepoRequestPayload;
}

export class ToDiskDeleteDevRepoResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @IsString()
  deletedRepoId: string;
}

export class ToDiskDeleteDevRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoResponsePayload)
  payload: ToDiskDeleteDevRepoResponsePayload;
}

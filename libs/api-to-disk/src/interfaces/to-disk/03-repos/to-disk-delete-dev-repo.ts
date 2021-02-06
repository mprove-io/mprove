import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteDevRepoRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly devRepoId: string;
}

export class ToDiskDeleteDevRepoRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoRequestPayload)
  readonly payload: ToDiskDeleteDevRepoRequestPayload;
}

export class ToDiskDeleteDevRepoResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly deletedRepoId: string;
}

export class ToDiskDeleteDevRepoResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoResponsePayload)
  readonly payload: ToDiskDeleteDevRepoResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskCreateProjectRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly devRepoId: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskCreateProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskCreateProjectRequestPayload)
  readonly payload: ToDiskCreateProjectRequestPayload;
}

export class ToDiskCreateProjectResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;
}

export class ToDiskCreateProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskCreateProjectResponsePayload)
  readonly payload: ToDiskCreateProjectResponsePayload;
}

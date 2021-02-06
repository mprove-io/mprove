import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteProjectRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;
}

export class ToDiskDeleteProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteProjectRequestPayload)
  readonly payload: ToDiskDeleteProjectRequestPayload;
}

export class ToDiskDeleteProjectResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly deletedProjectId: string;
}

export class ToDiskDeleteProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteProjectResponsePayload)
  readonly payload: ToDiskDeleteProjectResponsePayload;
}

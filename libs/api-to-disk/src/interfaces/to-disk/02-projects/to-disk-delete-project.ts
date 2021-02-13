import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { common } from '~api-to-disk/barrels/common';
import { ToDiskRequest } from '~api-to-disk/interfaces/to-disk/to-disk-request';

export class ToDiskDeleteProjectRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;
}

export class ToDiskDeleteProjectRequest extends ToDiskRequest {
  @ValidateNested()
  @Type(() => ToDiskDeleteProjectRequestPayload)
  payload: ToDiskDeleteProjectRequestPayload;
}

export class ToDiskDeleteProjectResponsePayload {
  @IsString()
  orgId: string;

  @IsString()
  deletedProjectId: string;
}

export class ToDiskDeleteProjectResponse extends common.MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteProjectResponsePayload)
  payload: ToDiskDeleteProjectResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

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

export class ToDiskDeleteProjectResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteProjectResponsePayload)
  payload: ToDiskDeleteProjectResponsePayload;
}

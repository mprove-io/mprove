import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import { BaseProject } from '~common/interfaces/backend/base-project';
import { MyResponse } from '~common/interfaces/to/my-response';
import { ToDiskRequest } from '../to-disk-request';

export class ToDiskDeleteDevRepoRequestPayload {
  @IsString()
  orgId: string;

  @IsString()
  projectId: string;

  @ValidateNested()
  @Type(() => BaseProject)
  baseProject: BaseProject;

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

export class ToDiskDeleteDevRepoResponse extends MyResponse {
  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoResponsePayload)
  payload: ToDiskDeleteDevRepoResponsePayload;
}

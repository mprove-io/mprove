import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/objects/_index';

export class ToDiskDeleteDevRepoRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly devRepoId: string;
}

export class ToDiskDeleteDevRepoRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

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

export class ToDiskDeleteDevRepoResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoResponsePayload)
  readonly payload: ToDiskDeleteDevRepoResponsePayload;
}

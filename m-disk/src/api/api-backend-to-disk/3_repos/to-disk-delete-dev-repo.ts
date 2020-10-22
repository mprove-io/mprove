import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../objects/_index';
import * as apiEnums from '../../enums/_index';

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
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskDeleteDevRepoResponsePayload)
  readonly payload: ToDiskDeleteDevRepoResponsePayload;
}

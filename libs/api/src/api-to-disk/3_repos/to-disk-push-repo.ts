import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import * as apiObjects from '~api/objects/_index';

export class ToDiskPushRepoRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskPushRepoRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskPushRepoRequestPayload)
  readonly payload: ToDiskPushRepoRequestPayload;
}

export class ToDiskPushRepoResponsePayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly currentBranch: string;

  @IsEnum(apiEnums.RepoStatusEnum)
  readonly repoStatus: apiEnums.RepoStatusEnum;

  @ValidateNested()
  @Type(() => apiObjects.DiskFileLine)
  readonly conflicts: apiObjects.DiskFileLine[];
}

export class ToDiskPushRepoResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskPushRepoResponsePayload)
  readonly payload: ToDiskPushRepoResponsePayload;
}

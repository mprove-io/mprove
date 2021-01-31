import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import * as apiObjects from '~api/objects/_index';

export class ToDiskMergeRepoRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly theirBranch: string;

  @IsBoolean()
  readonly isTheirBranchRemote: boolean;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskMergeRepoRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskMergeRepoRequestPayload)
  readonly payload: ToDiskMergeRepoRequestPayload;
}

export class ToDiskMergeRepoResponsePayload {
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

export class ToDiskMergeRepoResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskMergeRepoResponsePayload)
  readonly payload: ToDiskMergeRepoResponsePayload;
}

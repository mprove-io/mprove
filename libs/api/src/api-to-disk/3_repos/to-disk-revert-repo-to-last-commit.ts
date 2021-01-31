import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import * as apiObjects from '~api/objects/_index';

export class ToDiskRevertRepoToLastCommitRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskRevertRepoToLastCommitRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskRevertRepoToLastCommitRequestPayload)
  readonly payload: ToDiskRevertRepoToLastCommitRequestPayload;
}

export class ToDiskRevertRepoToLastCommitResponsePayload {
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

export class ToDiskRevertRepoToLastCommitResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskRevertRepoToLastCommitResponsePayload)
  readonly payload: ToDiskRevertRepoToLastCommitResponsePayload;
}

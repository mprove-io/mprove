import { Type } from 'class-transformer';
import { IsBoolean, IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/api/objects/_index';
import * as apiEnums from '~/api/enums/_index';

export class ToDiskCreateBranchRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly newBranch: string;

  @IsString()
  readonly fromBranch: string;

  @IsBoolean()
  readonly isFromRemote: boolean;
}

export class ToDiskCreateBranchRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateBranchRequestPayload)
  readonly payload: ToDiskCreateBranchRequestPayload;
}

export class ToDiskCreateBranchResponsePayload {
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

export class ToDiskCreateBranchResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateBranchResponsePayload)
  readonly payload: ToDiskCreateBranchResponsePayload;
}

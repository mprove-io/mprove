import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import * as apiObjects from '~api/objects/_index';

export class ToDiskCreateFileRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly parentNodeId: string;

  @IsString()
  readonly fileName: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskCreateFileRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateFileRequestPayload)
  readonly payload: ToDiskCreateFileRequestPayload;
}

export class ToDiskCreateFileResponsePayload {
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

  @ValidateNested()
  @Type(() => apiObjects.DiskCatalogNode)
  readonly nodes: Array<apiObjects.DiskCatalogNode>;
}

export class ToDiskCreateFileResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateFileResponsePayload)
  readonly payload: ToDiskCreateFileResponsePayload;
}
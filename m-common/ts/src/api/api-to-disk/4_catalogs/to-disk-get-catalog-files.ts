import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/api/objects/_index';
import * as apiEnums from '~/api/enums/_index';

export class ToDiskGetCatalogFilesRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskGetCatalogFilesRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesRequestPayload)
  readonly payload: ToDiskGetCatalogFilesRequestPayload;
}

export class ToDiskGetCatalogFilesResponsePayload {
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
  @Type(() => apiObjects.DiskCatalogFile)
  readonly files: apiObjects.DiskCatalogFile[];
}

export class ToDiskGetCatalogFilesResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskGetCatalogFilesResponsePayload)
  readonly payload: ToDiskGetCatalogFilesResponsePayload;
}

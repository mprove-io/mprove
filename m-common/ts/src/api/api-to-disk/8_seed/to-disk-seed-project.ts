import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '~/api/objects/_index';
import * as apiEnums from '~/api/enums/_index';

export class ToDiskSeedProjectRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly devRepoId: string;

  @IsString()
  readonly userAlias: string;
}

export class ToDiskSeedProjectRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskSeedProjectRequestPayload)
  readonly payload: ToDiskSeedProjectRequestPayload;
}

export class ToDiskSeedProjectResponsePayload {
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

  @ValidateNested()
  @Type(() => apiObjects.DiskCatalogNode)
  readonly nodes: Array<apiObjects.DiskCatalogNode>;
}

export class ToDiskSeedProjectResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskSeedProjectResponsePayload)
  readonly payload: ToDiskSeedProjectResponsePayload;
}

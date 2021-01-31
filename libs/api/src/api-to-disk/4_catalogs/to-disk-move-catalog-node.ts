import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~/enums/_index';
import * as apiObjects from '~/objects/_index';

export class ToDiskMoveCatalogNodeRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly fromNodeId: string;

  @IsString()
  readonly toNodeId: string;
}

export class ToDiskMoveCatalogNodeRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeRequestPayload)
  readonly payload: ToDiskMoveCatalogNodeRequestPayload;
}

export class ToDiskMoveCatalogNodeResponsePayload {
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

export class ToDiskMoveCatalogNodeResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskMoveCatalogNodeResponsePayload)
  readonly payload: ToDiskMoveCatalogNodeResponsePayload;
}

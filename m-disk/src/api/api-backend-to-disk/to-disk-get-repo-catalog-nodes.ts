import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../objects/_index';
import * as apiEnums from '../enums/_index';

export class ToDiskGetRepoCatalogNodesRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskGetRepoCatalogNodesRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskGetRepoCatalogNodesRequestPayload)
  readonly payload: ToDiskGetRepoCatalogNodesRequestPayload;
}

export class ToDiskGetRepoCatalogNodesResponsePayload {
  @IsEnum(apiEnums.RepoStatusEnum)
  readonly repoStatus: apiEnums.RepoStatusEnum;

  @IsString()
  readonly currentBranch: string;

  @ValidateNested()
  @Type(() => apiObjects.FileLine)
  readonly conflicts: apiObjects.FileLine[];

  @ValidateNested()
  @Type(() => apiObjects.CatalogNode)
  readonly nodes: Array<apiObjects.CatalogNode>;
}

export class ToDiskGetRepoCatalogNodesResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskGetRepoCatalogNodesResponsePayload)
  readonly payload: ToDiskGetRepoCatalogNodesResponsePayload;
}

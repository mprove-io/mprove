import { Type } from 'class-transformer';
import { IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../../_index';
import * as apiEnums from '../../enums/_index';

export class ToDiskGetCatalogNodesRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsOptional()
  @IsString()
  readonly branch?: string;
}

export class ToDiskGetCatalogNodesRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesRequestPayload)
  readonly payload: ToDiskGetCatalogNodesRequestPayload;
}

export class ToDiskGetCatalogNodesResponsePayload {
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

export class ToDiskGetCatalogNodesResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskGetCatalogNodesResponsePayload)
  readonly payload: ToDiskGetCatalogNodesResponsePayload;
}

import * as apiObjects from '../objects/_index';
import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '../enums/_index';

export class ToDiskMoveNodeRequestPayload {
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

export class ToDiskMoveNodeRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskMoveNodeRequestPayload)
  readonly payload: ToDiskMoveNodeRequestPayload;
}

export class ToDiskMoveNodeResponsePayload {
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
  @Type(() => apiObjects.FileLine)
  readonly conflicts: apiObjects.FileLine[];

  @ValidateNested()
  @Type(() => apiObjects.CatalogNode)
  readonly nodes: Array<apiObjects.CatalogNode>;
}

export class ToDiskMoveNodeResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskMoveNodeResponsePayload)
  readonly payload: ToDiskMoveNodeResponsePayload;
}

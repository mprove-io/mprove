import * as apiObjects from '../objects/_index';
import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '../enums/_index';

export class ToDiskRenameNodeRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;

  @IsString()
  readonly nodeId: string;

  @IsString()
  readonly newName: string;
}

export class ToDiskRenameNodeRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskRenameNodeRequestPayload)
  readonly payload: ToDiskRenameNodeRequestPayload;
}

export class ToDiskRenameNodeResponsePayload {
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

export class ToDiskRenameNodeResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskRenameNodeResponsePayload)
  readonly payload: ToDiskRenameNodeResponsePayload;
}

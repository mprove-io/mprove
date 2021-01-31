import { Type } from 'class-transformer';
import { IsEnum, IsString, ValidateNested } from 'class-validator';
import * as apiEnums from '~api/enums/_index';
import * as apiObjects from '~api/objects/_index';

export class ToDiskCreateFolderRequestPayload {
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
  readonly folderName: string;
}

export class ToDiskCreateFolderRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateFolderRequestPayload)
  readonly payload: ToDiskCreateFolderRequestPayload;
}

export class ToDiskCreateFolderResponsePayload {
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

export class ToDiskCreateFolderResponse {
  @ValidateNested()
  @Type(() => apiObjects.ResponseInfo)
  readonly info: apiObjects.ResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskCreateFolderResponsePayload)
  readonly payload: ToDiskCreateFolderResponsePayload;
}

import { Type } from 'class-transformer';
import { IsString, ValidateNested } from 'class-validator';
import * as apiObjects from '../objects/_index';

export class ToDiskGetRepoCatalogFilesRequestPayload {
  @IsString()
  readonly organizationId: string;

  @IsString()
  readonly projectId: string;

  @IsString()
  readonly repoId: string;

  @IsString()
  readonly branch: string;
}

export class ToDiskGetRepoCatalogFilesRequest {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskRequestInfo)
  readonly info: apiObjects.ToDiskRequestInfo;

  @ValidateNested()
  @Type(() => ToDiskGetRepoCatalogFilesRequestPayload)
  readonly payload: ToDiskGetRepoCatalogFilesRequestPayload;
}

export class ToDiskGetRepoCatalogFilesResponsePayload {
  @ValidateNested()
  @Type(() => apiObjects.CatalogItemFile)
  readonly files: Array<apiObjects.CatalogItemFile>;
}

export class ToDiskGetRepoCatalogFilesResponse {
  @ValidateNested()
  @Type(() => apiObjects.ToDiskResponseInfo)
  readonly info: apiObjects.ToDiskResponseInfo;

  @ValidateNested()
  @Type(() => ToDiskGetRepoCatalogFilesResponsePayload)
  readonly payload: ToDiskGetRepoCatalogFilesResponsePayload;
}

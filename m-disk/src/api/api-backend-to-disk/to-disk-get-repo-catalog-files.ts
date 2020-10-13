import * as apiObjects from '../objects/_index';

export class ToDiskGetRepoCatalogFilesRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly repoId: string;
  };
}

export class ToDiskGetRepoCatalogFilesResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
  readonly payload: {
    readonly files: Array<apiObjects.CatalogItemFile>;
  };
}

import * as apiObjects from '../objects/_index';

export class ToDiskGetRepoCatalogNodesRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly repoId: string;
  };
}

export class ToDiskGetRepoCatalogNodesResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
  readonly payload: {
    readonly nodes: Array<apiObjects.CatalogNode>;
  };
}

import * as apiObjects from '../objects/_index';

export class ToDiskCreateDevRepoRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly devRepoId: string;
  };
}

export class ToDiskCreateDevRepoResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly devRepoId: string;
  };
}

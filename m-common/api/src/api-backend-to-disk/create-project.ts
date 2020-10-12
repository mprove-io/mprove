import * as apiObjects from '../objects/_index';

export class CreateProjectRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly repoId: string;
  };
}

export class CreateProjectResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly repoId: string;
  };
}

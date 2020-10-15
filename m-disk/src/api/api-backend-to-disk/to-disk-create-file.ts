import * as apiObjects from '../objects/_index';

export class ToDiskCreateFileRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly repoId: string;
    readonly branch: string;
    readonly parentNodeId: string;
    readonly fileName: string;
  };
}

export class ToDiskCreateFileResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
}

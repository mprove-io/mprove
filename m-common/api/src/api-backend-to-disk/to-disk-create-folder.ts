import * as apiObjects from '../objects/_index';

export class ToDiskCreateFolderRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly repoId: string;
    readonly branch: string;
    readonly parentNodeId: string;
    readonly folderName: string;
  };
}

export class ToDiskCreateFolderResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
}

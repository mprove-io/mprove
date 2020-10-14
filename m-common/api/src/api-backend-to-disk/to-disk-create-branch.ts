import * as apiObjects from '../objects/_index';

export class ToDiskCreateBranchRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
    readonly projectId: string;
    readonly repoId: string;
    readonly fromBranch: string;
    readonly newBranch: string;
  };
}

export class ToDiskCreateBranchResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
}

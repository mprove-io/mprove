import * as apiObjects from '../objects/_index';

export class ToDiskCreateOrganizationRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
  };
}

export class ToDiskCreateOrganizationResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
  readonly payload: {
    readonly organizationId: string;
  };
}

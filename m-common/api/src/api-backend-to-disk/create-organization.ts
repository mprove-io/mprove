import * as apiObjects from '../objects/_index';

export class CreateOrganizationRequest {
  readonly info: apiObjects.ToDiskRequestInfo;
  readonly payload: {
    readonly organizationId: string;
  };
}

export class CreateOrganizationResponse {
  readonly info: apiObjects.ToDiskResponseInfo;
  readonly payload: {
    readonly organizationId: string;
  };
}

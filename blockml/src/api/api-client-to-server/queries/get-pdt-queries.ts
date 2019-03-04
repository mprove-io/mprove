import * as apiObjects from '../../objects/_index';

export interface GetPdtQueriesRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    struct_id: string;
  };
}

export interface GetPdtQueriesResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    queries: apiObjects.Query[];
  };
}

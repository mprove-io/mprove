import * as apiObjects from '../../objects/_index';

export interface CreateMconfigAndQueryRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    mconfig: apiObjects.Mconfig;
    query: apiObjects.Query;
  };
}

export interface CreateMconfigAndQueryResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    mconfig: apiObjects.Mconfig;
    queries: apiObjects.Query[];
  };
}
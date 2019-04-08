import * as apiObjects from '../../objects/_index';

export interface DuplicateMconfigAndQueryRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    mconfig_id: string;
    query_id: string;
  };
}

export interface DuplicateMconfigAndQueryResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    mconfig: apiObjects.Mconfig;
    queries: apiObjects.Query[];
  };
}

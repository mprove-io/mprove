import * as apiObjects from '../../objects/_index';

export interface GetMconfigRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    mconfig_id: string;
  };
}

export interface GetMconfigResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    mconfig_or_empty: apiObjects.Mconfig[];
  };
}

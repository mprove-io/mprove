import * as apiObjects from '../../objects/_index';

export interface CreateMconfigRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    mconfig: apiObjects.Mconfig;
  };
}

export interface CreateMconfigResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    mconfig: apiObjects.Mconfig;
  };
}

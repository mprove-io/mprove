import * as apiObjects from '../../objects/_index';

export interface CheckProjectIdUniqueRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
  };
}

export interface CheckProjectIdUniqueResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project_id: string;
    is_unique: boolean;
    is_valid: boolean;
  };
}

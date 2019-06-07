import * as apiObjects from '../../objects/_index';
import * as apiEnums from '../../enums/_index';

export interface SetProjectConnectionRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    connection: apiEnums.ProjectConnectionEnum;
    server_ts: number;
  };
}

export interface SetProjectConnectionResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
  };
}

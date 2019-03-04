import * as apiObjects from '../../objects/_index';
import * as apiEnums from '../../enums/_index';

export interface SetProjectWeekStartRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    week_start: apiEnums.ProjectWeekStartEnum;
    server_ts: number;
  };
}

export interface SetProjectWeekStartResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
    dev_struct: apiObjects.Struct;
    prod_struct: apiObjects.Struct;
  };
}

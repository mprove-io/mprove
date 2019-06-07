import * as apiObjects from '../objects/_index';
import * as apiEnums from '../enums/_index';

export interface ProcessQueryRequestBody {
  info: apiObjects.ServerRequestToBlockml;
  payload: {
    project_id: string;
    bigquery_project: string;
    week_start: apiEnums.ProjectWeekStartEnum;
    connection: apiEnums.ProjectConnectionEnum;
    mconfig: apiObjects.Mconfig;
    model_content: string;
    udfs_content: string;
    struct_id: string;
  };
}

export interface ProcessQueryResponse200Body {
  info: apiObjects.BlockmlResponse;
  payload: {
    query: apiObjects.Query;
    mconfig: apiObjects.Mconfig;
  };
}

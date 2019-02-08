import * as apiObjects from '../objects/_index';
import * as apiEnums from '../enums/_index';

export interface RebuildStructRequestBody {
  info: apiObjects.ServerRequestToBlockml;
  payload: {
    files: apiObjects.File[];
    project_id: string;
    repo_id: string;
    bigquery_project: string;
    week_start: apiEnums.ProjectWeekStartEnum;
    struct_id: string;
  };
}

export interface RebuildStructResponse200Body {
  info: apiObjects.BlockmlResponse;
  payload: {
    struct: apiObjects.StructFull;
    udfs_content: string;
    pdts_sorted: string[];
  };
}

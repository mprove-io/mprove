import * as apiObjects from '../../objects/_index';

export interface SaveFileRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
    repo_id: string;
    file_id: string;
    server_ts: number;
    content: string;
  };
}

export interface SaveFileResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    saved_dev_file: apiObjects.CatalogFile;
    dev_struct: apiObjects.Struct;
  };
}

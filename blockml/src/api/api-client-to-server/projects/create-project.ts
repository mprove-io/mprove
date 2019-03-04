import * as apiObjects from '../../objects/_index';

export interface CreateProjectRequestBody {
  info: apiObjects.ClientRequest;
  payload: {
    project_id: string;
  };
}

export interface CreateProjectResponse200Body {
  info: apiObjects.ServerResponse;
  payload: {
    project: apiObjects.Project;
    member: apiObjects.Member;
    dev_files: apiObjects.CatalogFile[];
    prod_files: apiObjects.CatalogFile[];
    dev_struct: apiObjects.Struct;
    prod_struct: apiObjects.Struct;
  };
}

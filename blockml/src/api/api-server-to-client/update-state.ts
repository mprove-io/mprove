import * as apiObjects from '../objects/_index';

export interface UpdateStateRequestBody {
  info: apiObjects.ServerRequestToClient;
  payload: {
    dashboards: apiObjects.Dashboard[];
    errors: apiObjects.SwError[];
    files: apiObjects.CatalogFile[];
    mconfigs: apiObjects.Mconfig[];
    members: apiObjects.Member[];
    models: apiObjects.Model[];
    views: apiObjects.View[];
    projects: apiObjects.Project[];
    queries: apiObjects.Query[];
    repos: apiObjects.Repo[];
    user: apiObjects.User;
  };
}

import * as apiObjects from '../../objects/_index';

export interface UpdateStateRequestBodyPayload {
  dashboards: apiObjects.Dashboard[];
  errors: apiObjects.SwError[];
  files: apiObjects.CatalogFile[];
  mconfigs: apiObjects.Mconfig[];
  members: apiObjects.Member[];
  models: apiObjects.Model[];
  projects: apiObjects.Project[];
  queries: apiObjects.Query[];
  repos: apiObjects.Repo[];
  user: apiObjects.User;
}

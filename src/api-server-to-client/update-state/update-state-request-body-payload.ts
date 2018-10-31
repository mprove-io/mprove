import * as api from '../../_index';

export interface UpdateStateRequestBodyPayload {
  dashboards: api.Dashboard[];
  errors: api.SwError[];
  files: api.CatalogFile[];
  mconfigs: api.Mconfig[];
  members: api.Member[];
  models: api.Model[];
  projects: api.Project[];
  queries: api.Query[];
  repos: api.Repo[];
  user: api.User;
}

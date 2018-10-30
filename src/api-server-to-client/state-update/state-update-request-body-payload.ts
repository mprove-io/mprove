import * as api from '../../_index';

export interface StateUpdateRequestBodyPayload {
  dashboards: api.Dashboard[];
  errors: api.SwError[];
  files: api.CatalogFile[];
  mconfigs: api.Mconfig[];
  members: api.Member[];
  api: api.Model[];
  projects: api.Project[];
  queries: api.Query[];
  repos: api.Repo[];
  user: api.User;
}

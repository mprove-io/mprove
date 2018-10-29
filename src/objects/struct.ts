import * as api from '../_index';

export interface Struct {
  errors: Array<api.SwError>;
  models: Array<api.Model>;
  dashboards: Array<api.Dashboard>;
  repo: api.Repo;
}
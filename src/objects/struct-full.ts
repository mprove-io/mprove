import * as api from '../_index';

export interface StructFull {
  errors: api.SwError[];
  models: api.Model[];
  dashboards: api.Dashboard[];
  mconfigs: api.Mconfig[];
  queries: api.Query[];
}

import * as api from '../_index';

export interface Struct {
    errors: api.SwError[];
    models: api.Model[];
    dashboards: api.Dashboard[];
    repo: api.Repo;
}

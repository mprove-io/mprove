import * as api from '../_index';

export interface StructFull {
    errors: Array<api.SwError>;
    models: Array<api.Model>;
    dashboards: Array<api.Dashboard>;
    mconfigs: Array<api.Mconfig>;
    queries: Array<api.Query>;
}
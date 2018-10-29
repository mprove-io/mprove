import * as api from '../_index';

export interface Mconfig {
    mconfig_id: string;
    query_id: string;
    project_id: string;
    repo_id: string;
    struct_id: string;
    model_id: string;
    select: string[];
    sortings: api.Sorting[];
    sorts: string;
    timezone: string;
    limit: number;
    filters: api.Filter[];
    charts: api.Chart[];
    temp: boolean;
    server_ts: number;
}

import * as api from '../_index';

export interface Project {
    project_id: string;
    has_credentials: boolean;
    bq_project: string;
    client_email: string;
    query_size_limit: number;
    week_start: api.ProjectWeekStartEnum;
    timezone: string;
    analytics_plan_id: number;
    analytics_max_plan_id: number;
    analytics_subscription_id: number;
    deleted: boolean;
    server_ts: number;
}

import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToApiDashboard(
  dashboard: entities.DashboardEntity
): api.Dashboard {
  return {
    dashboard_id: dashboard.dashboard_id,
    project_id: dashboard.project_id,
    repo_id: dashboard.repo_id,
    struct_id: dashboard.struct_id,
    content: dashboard.content,
    access_users: JSON.parse(dashboard.access_users),
    title: dashboard.title,
    gr: dashboard.gr,
    hidden: helper.benumToBoolean(dashboard.hidden),
    fields: JSON.parse(dashboard.fields),
    reports: JSON.parse(dashboard.reports),
    temp: helper.benumToBoolean(dashboard.temp),
    description: dashboard.description,
    server_ts: Number(dashboard.server_ts)
  };
}

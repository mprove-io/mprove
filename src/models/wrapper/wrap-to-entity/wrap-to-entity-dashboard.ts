import { api } from '../../../barrels/api';
import { entities } from '../../../barrels/entities';
import { helper } from '../../../barrels/helper';

export function wrapToEntityDashboard(
  dashboard: api.Dashboard
): entities.DashboardEntity {
  return {
    dashboard_id: helper.undefinedToNull(dashboard.dashboard_id),
    project_id: helper.undefinedToNull(dashboard.project_id),
    repo_id: helper.undefinedToNull(dashboard.repo_id),
    struct_id: helper.undefinedToNull(dashboard.struct_id),
    content: helper.undefinedToNull(dashboard.content),
    access_users: dashboard.access_users
      ? JSON.stringify(dashboard.access_users)
      : null,
    title: helper.undefinedToNull(dashboard.title),
    gr: helper.undefinedToNull(dashboard.gr),
    hidden: helper.booleanToBenum(dashboard.hidden),
    fields: dashboard.fields ? JSON.stringify(dashboard.fields) : null,
    reports: dashboard.reports ? JSON.stringify(dashboard.reports) : null,
    temp: helper.booleanToBenum(dashboard.temp),
    description: helper.undefinedToNull(dashboard.description),
    server_ts: dashboard.server_ts ? dashboard.server_ts.toString() : null
  };
}

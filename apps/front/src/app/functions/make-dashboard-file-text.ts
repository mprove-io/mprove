import { common } from '~front/barrels/common';
import { DashboardState } from '../stores/dashboard.store';
import { prepareReport } from './prepare-report';
import { toYaml } from './to-yaml';

export function makeDashboardFileText(item: {
  dashboard: DashboardState;
  newDashboardId: string;
  newTitle: string;
  group: string;
  roles: string;
  users: string;
}) {
  let { dashboard, newDashboardId, newTitle, group, roles, users } = item;

  let fields = dashboard.fields.map(field => ({
    filter: field.id,
    hidden: field.hidden,
    label: field.label,
    description: field.description,
    result: field.result,
    default:
      common.isDefined(field.fractions) && field.fractions.length > 0
        ? field.fractions.map(x => x.brick)
        : undefined
  }));

  let reps = dashboard.reports.map(x =>
    prepareReport({
      isForDashboard: true,
      mconfig: x.mconfig
    })
  );

  let dashboardFileText = toYaml({
    dashboard: newDashboardId,
    title: newTitle.trim(),
    description: common.isDefined(dashboard.description)
      ? dashboard.description
      : undefined,
    group:
      common.isDefined(group) && group.trim().length > 0
        ? group.trim()
        : undefined,
    access_roles:
      common.isDefined(roles) && roles.trim().length > 0
        ? roles.split(',').map(x => x.trim())
        : undefined,
    access_users:
      common.isDefined(users) && users.trim().length > 0
        ? users.split(',').map(x => x.trim())
        : undefined,
    fields: fields,
    reports: reps
  });

  return dashboardFileText;
}

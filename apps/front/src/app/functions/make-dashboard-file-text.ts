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

  let reps = dashboard.reports.map(x => {
    let newMconfig = common.makeCopy(x.mconfig);

    newMconfig.chart.tileX = x.tileX;
    newMconfig.chart.tileY = x.tileY;
    newMconfig.chart.tileHeight = x.tileHeight;
    newMconfig.chart.tileWidth = x.tileWidth;

    Object.keys(newMconfig.listen).forEach(z => {
      let dashboardFieldName = newMconfig.listen[z];

      if (fields.findIndex(f => f.filter === dashboardFieldName) < 0) {
        delete newMconfig.listen[z];
      }
    });

    return prepareReport({
      isForDashboard: true,
      mconfig: newMconfig
    });
  });

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
    fields: common.isDefined(fields) && fields.length > 0 ? fields : undefined,
    reports: common.isDefined(reps) && reps.length > 0 ? reps : undefined
  });

  return dashboardFileText;
}

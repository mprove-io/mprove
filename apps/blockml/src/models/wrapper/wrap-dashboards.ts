import { common } from '~blockml/barrels/common';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { wrapReports } from './wrap-reports';

export function wrapDashboards(item: {
  structId: string;
  orgId: string;
  projectId: string;
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
}) {
  let { structId, orgId, projectId, models, dashboards } = item;

  let apiDashboards: common.Dashboard[] = [];
  let dashMconfigs: common.Mconfig[] = [];
  let dashQueries: common.Query[] = [];

  dashboards.forEach(x => {
    let dashFields: common.DashboardField[] = [];

    x.fields.forEach(field => {
      dashFields.push({
        id: field.name,
        hidden: helper.toBoolean(field.hidden),
        label: field.label,
        result: field.result,
        fractions: field.fractions,
        description: field.description
      });
    });

    let { apiReports, mconfigs, queries } = wrapReports({
      orgId: orgId,
      projectId: projectId,
      structId: structId,
      models: models,
      reports: x.reports
    });

    dashMconfigs = [...dashMconfigs, ...mconfigs];
    dashQueries = [...dashQueries, ...queries];

    apiDashboards.push({
      structId: structId,
      dashboardId: x.name,
      filePath: x.filePath,
      content: x,
      accessUsers: x.access_users || [],
      accessRoles: x.access_roles || [],
      title: x.title,
      description: x.description,
      gr: x.group,
      hidden: helper.toBoolean(x.hidden),
      fields: dashFields,
      reports: apiReports,
      temp: false,
      serverTs: 1
    });
  });

  return {
    apiDashboards: apiDashboards,
    dashMconfigs: dashMconfigs,
    dashQueries: dashQueries
  };
}

import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { wrapReports } from './wrap-reports';

export function wrapDashboards(item: {
  structId: string;
  organizationId: string;
  projectId: string;
  dashboards: interfaces.Dashboard[];
  models: interfaces.Model[];
}) {
  let { structId, organizationId, projectId, models, dashboards } = item;

  let apiDashboards: api.Dashboard[] = [];
  let dashMconfigs: api.Mconfig[] = [];
  let dashQueries: api.Query[] = [];

  dashboards.forEach(x => {
    let dashFields: api.DashboardField[] = [];

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
      organizationId: organizationId,
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
      content: x,
      accessUsers: x.access_users || [],
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

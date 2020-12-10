import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { wrapReports } from './wrap-reports';

export function wrapDashboards(item: {
  projectId: string;
  repoId: string;
  structId: string;
  dashboards: interfaces.Dashboard[];
}) {
  let apiDashboards: api.Dashboard[] = [];
  let dashMconfigs: api.Mconfig[] = [];
  let dashQueries: api.Query[] = [];

  item.dashboards.forEach(x => {
    let dashFields: api.DashboardField[] = [];

    x.fields.forEach(field => {
      dashFields.push({
        id: field.name,
        hidden: helper.toBoolean(field.hidden),
        label: field.label,
        result: <any>field.result,
        fractions: field.fractions,
        description: field.description
      });
    });

    let { apiReports, mconfigs, queries } = wrapReports({
      projectId: item.projectId,
      repoId: item.repoId,
      structId: item.structId,
      reports: x.reports
    });

    dashMconfigs = [...dashMconfigs, ...mconfigs];
    dashQueries = [...dashQueries, ...queries];

    apiDashboards.push({
      projectId: item.projectId,
      repoId: item.repoId,
      dashboardId: x.name,
      structId: item.structId,
      content: JSON.stringify(x),
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

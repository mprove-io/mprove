import { common } from '~blockml/barrels/common';
import { wrapTiles } from './wrap-tiles';

export function wrapDashboards(item: {
  structId: string;
  orgId: string;
  projectId: string;
  dashboards: common.FileDashboard[];
  models: common.FileModel[];
  stores: common.FileStore[];
  envId: string;
  timezone: string;
}) {
  let {
    structId,
    orgId,
    projectId,
    models,
    stores,
    dashboards,
    envId,
    timezone
  } = item;

  let apiDashboards: common.Dashboard[] = [];
  let dashMconfigs: common.Mconfig[] = [];
  let dashQueries: common.Query[] = [];

  dashboards.forEach(x => {
    let dashFields: common.DashboardField[] = [];

    x.fields.forEach(field => {
      dashFields.push({
        id: field.name,
        hidden: common.toBooleanFromLowercaseString(field.hidden),
        label: field.label,
        result: field.result,
        fractions: field.fractions,
        description: field.description,
        suggestModelDimension: field.suggest_model_dimension
      });
    });

    let { apiTiles, mconfigs, queries } = wrapTiles({
      orgId: orgId,
      projectId: projectId,
      structId: structId,
      models: models,
      stores: stores,
      tiles: x.tiles,
      envId: envId,
      timezone: timezone
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
      hidden: common.toBooleanFromLowercaseString(x.hidden),
      fields: dashFields,
      tiles: apiTiles,
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

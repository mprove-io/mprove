import { api } from '~/barrels/api';
import { helper } from '~/barrels/helper';
import { interfaces } from '~/barrels/interfaces';
import { wrapReports } from './wrap-reports';

export function wrapVizs(item: {
  structId: string;
  organizationId: string;
  projectId: string;
  models: interfaces.Model[];
  vizs: interfaces.Viz[];
}) {
  let { structId, organizationId, projectId, models, vizs } = item;

  let apiVizs: api.Viz[] = [];
  let vizMconfigs: api.Mconfig[] = [];
  let vizQueries: api.Query[] = [];

  vizs.forEach(x => {
    let { apiReports, mconfigs, queries } = wrapReports({
      organizationId: organizationId,
      projectId: projectId,
      structId: structId,
      models: models,
      reports: x.reports
    });

    vizMconfigs = [...vizMconfigs, ...mconfigs];
    vizQueries = [...vizQueries, ...queries];

    apiVizs.push({
      structId: structId,
      vizId: x.name,
      accessUsers: x.access_users || [],
      accessRoles: x.access_roles || [],
      gr: x.group,
      hidden: helper.toBoolean(x.hidden),
      reports: apiReports,
      temp: false,
      serverTs: 1
    });
  });

  return {
    apiVizs: apiVizs,
    vizMconfigs: vizMconfigs,
    vizQueries: vizQueries
  };
}

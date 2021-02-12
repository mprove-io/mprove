import { apiToBlockml } from '~blockml/barrels/api-to-blockml';
import { helper } from '~blockml/barrels/helper';
import { interfaces } from '~blockml/barrels/interfaces';
import { wrapReports } from './wrap-reports';

export function wrapVizs(item: {
  structId: string;
  orgId: string;
  projectId: string;
  models: interfaces.Model[];
  vizs: interfaces.Viz[];
}) {
  let { structId, orgId, projectId, models, vizs } = item;

  let apiVizs: apiToBlockml.Viz[] = [];
  let vizMconfigs: apiToBlockml.Mconfig[] = [];
  let vizQueries: apiToBlockml.Query[] = [];

  vizs.forEach(x => {
    let { apiReports, mconfigs, queries } = wrapReports({
      orgId: orgId,
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
      serverTs: 1
    });
  });

  return {
    apiVizs: apiVizs,
    vizMconfigs: vizMconfigs,
    vizQueries: vizQueries
  };
}

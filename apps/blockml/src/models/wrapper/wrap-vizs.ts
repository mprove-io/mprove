import { common } from '~blockml/barrels/common';
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

  let apiVizs: common.Viz[] = [];
  let vizMconfigs: common.Mconfig[] = [];
  let vizQueries: common.Query[] = [];

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

    let model = models.find(m => m.name === x.reports[0].model);

    apiVizs.push({
      structId: structId,
      vizId: x.name,
      title: x.reports[0].title,
      modelId: model.name,
      modelLabel: model.label,
      filePath: x.filePath,
      accessUsers: x.access_users || [],
      accessRoles: x.access_roles || [],
      gr: x.group,
      hidden: helper.toBooleanFromLowercaseString(x.hidden),
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

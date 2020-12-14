import { api } from '../../barrels/api';
import { helper } from '../../barrels/helper';
import { interfaces } from '../../barrels/interfaces';
import { wrapReports } from './wrap-reports';

export function wrapVizs(item: {
  organizationId: string;
  projectId: string;
  repoId: string;
  structId: string;
  vizs: interfaces.Viz[];
}) {
  let apiVizs: api.Viz[] = [];
  let vizMconfigs: api.Mconfig[] = [];
  let vizQueries: api.Query[] = [];

  item.vizs.forEach(x => {
    let { apiReports, mconfigs, queries } = wrapReports({
      organizationId: item.organizationId,
      projectId: item.projectId,
      repoId: item.repoId,
      structId: item.structId,
      reports: x.reports
    });

    vizMconfigs = [...vizMconfigs, ...mconfigs];
    vizQueries = [...vizQueries, ...queries];

    apiVizs.push({
      organizationId: item.organizationId,
      projectId: item.projectId,
      repoId: item.repoId,
      vizId: x.name,
      structId: item.structId,
      accessUsers: x.access_users || [],
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

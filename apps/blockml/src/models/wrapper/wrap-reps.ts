import { common } from '~blockml/barrels/common';
import { interfaces } from '~blockml/barrels/interfaces';

export function wrapReps(item: {
  projectId: string;
  structId: string;
  reps: interfaces.Rep[];
  metrics: common.MetricAny[];
}) {
  let { projectId, structId, reps, metrics } = item;

  let apiReps: common.Rep[] = reps.map(x => {
    let rep: common.Rep = {
      projectId: projectId,
      structId: structId,
      repId: x.name,
      draft: false,
      creatorId: undefined,
      filePath: x.filePath,
      accessUsers: x.access_users || [],
      accessRoles: x.access_roles || [],
      title: x.title,
      timezone: undefined,
      timeSpec: undefined,
      timeRangeFraction: undefined,
      columns: [],
      rows: x.rows.map(row => {
        let metric = metrics.find(m => m.metricId === row.metric);

        let rowApi: common.Row = {
          rowId: row.id,
          metricId: row.metric,
          formula: row.formula,
          rqs: [],
          query: undefined,
          mconfig: undefined,
          hasAccessToModel: false,
          params: row.params,
          records: [],
          formatNumber: metric.formatNumber,
          currencyPrefix: metric.currencyPrefix,
          currencySuffix: metric.currencySuffix
        };
        return rowApi;
      }),
      timeColumnsLength: undefined,
      timeColumnsLimit: undefined,
      isTimeColumnsLimitExceeded: false,
      draftCreatedTs: 1,
      serverTs: 1
    };
    return rep;
  });

  return apiReps;
}

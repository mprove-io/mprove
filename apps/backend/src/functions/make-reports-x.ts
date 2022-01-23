import { common } from '~backend/barrels/common';

export function makeReportsX(item: {
  reports: common.Report[];
  mconfigs: common.Mconfig[];
  queries: common.Query[];
  isAddMconfigAndQuery: boolean;
  models: common.ModelX[];
}): common.ReportX[] {
  let { reports, mconfigs, queries, isAddMconfigAndQuery, models } = item;

  let reportsX: common.ReportX[] = reports.map(x => {
    let reportX: common.ReportX = Object.assign({}, x, <common.ReportX>{
      hasAccessToModel: models.find(m => m.modelId === reportX.modelId)
        .hasAccess
    });

    if (isAddMconfigAndQuery === true) {
      reportX.mconfig = mconfigs.find(m => m.mconfigId === x.mconfigId);
      reportX.query = queries.find(q => q.queryId === x.queryId);
    }

    return reportX;
  });

  return reportsX;
}

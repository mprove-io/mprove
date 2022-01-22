import { common } from '~backend/barrels/common';

export function makeReportsX(item: {
  reports: common.Report[];
  mconfigs: common.Mconfig[];
  queries: common.Query[];
  isAddMconfigAndQuery: boolean;
  modelsList: common.ModelsItem[];
}): common.ReportX[] {
  let { reports, mconfigs, queries, isAddMconfigAndQuery, modelsList } = item;

  let reportsX: common.ReportX[] = reports.map(x => {
    let reportX: common.ReportX = x;

    if (isAddMconfigAndQuery === true) {
      reportX.mconfig = mconfigs.find(m => m.mconfigId === x.mconfigId);
      reportX.query = queries.find(q => q.queryId === x.queryId);
    }

    reportX.hasAccessToModel = modelsList.find(
      m => m.modelId === reportX.modelId
    ).hasAccess;

    return reportX;
  });

  return reportsX;
}

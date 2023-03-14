import { common } from '~backend/barrels/common';

export function makeReportsX(item: {
  reports: common.Report[];
  mconfigs: common.MconfigX[];
  queries: common.Query[];
  isAddMconfigAndQuery: boolean;
  models: common.ModelX[];
  dashboardExtendedFilters: common.FilterX[];
}): common.ReportX[] {
  let {
    reports,
    mconfigs,
    queries,
    isAddMconfigAndQuery,
    models,
    dashboardExtendedFilters
  } = item;

  let reportsX: common.ReportX[] = reports.map(x => {
    let reportX: common.ReportX = Object.assign({}, x, <common.ReportX>{
      hasAccessToModel: models.find(m => m.modelId === x.modelId).hasAccess
    });

    if (isAddMconfigAndQuery === true) {
      reportX.mconfig = mconfigs.find(m => m.mconfigId === x.mconfigId);
      reportX.query = queries.find(q => q.queryId === x.queryId);

      let listen = reportX.listen;

      if (common.isDefined(dashboardExtendedFilters)) {
        reportX.mconfig.extendedFilters = reportX.mconfig.extendedFilters.sort(
          (a, b) => {
            if (common.isDefined(listen[a.fieldId])) {
              let aIndex = dashboardExtendedFilters.findIndex(
                df => df.fieldId === listen[a.fieldId]
              );

              if (common.isDefined(listen[b.fieldId])) {
                let bIndex = dashboardExtendedFilters.findIndex(
                  df => df.fieldId === listen[b.fieldId]
                );
                return aIndex > bIndex ? 1 : bIndex > aIndex ? -1 : 0;
              } else {
                return -1;
              }
            } else if (common.isDefined(listen[b.fieldId])) {
              return 1;
            } else {
              return a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0;
            }
          }
        );
      } else {
        reportX.mconfig.extendedFilters = reportX.mconfig.extendedFilters.sort(
          (a, b) => (a.fieldId > b.fieldId ? 1 : b.fieldId > a.fieldId ? -1 : 0)
        );
      }
    }

    return reportX;
  });

  return reportsX;
}

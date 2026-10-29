import type { ReportTab } from '#backend/drizzle/postgres/tables/reports';
import { makeReportFullId } from '#backend/functions/hash/make-report-full-id/make-report-full-id';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import type { Report } from '#common/types/blockml/parts/report/report';

export function reportApiToTab(item: { apiReport: Report }): ReportTab {
  let { apiReport } = item;

  if (isUndefined(apiReport)) {
    return;
  }

  let report: ReportTab = {
    reportFullId: makeReportFullId({
      structId: apiReport.structId,
      reportId: apiReport.reportId
    }),
    projectId: apiReport.projectId,
    structId: apiReport.structId,
    reportId: apiReport.reportId,
    creatorId: apiReport.creatorId,
    draft: apiReport.draft,
    draftCreatedTs: apiReport.draftCreatedTs,
    filePath: apiReport.filePath,
    space: apiReport.space,
    fields: apiReport.fields,
    accessRoles: apiReport.accessRoles,
    accessRolesCombined: apiReport.accessRolesCombined,
    title: apiReport.title,
    chart: apiReport.chart,
    rows: apiReport.rows,
    keyTag: undefined,
    serverTs: apiReport.serverTs
  };

  return report;
}

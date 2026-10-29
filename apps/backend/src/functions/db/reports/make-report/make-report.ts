import type { ReportTab } from '#backend/drizzle/postgres/tables/reports';
import { makeReportFullId } from '#backend/functions/hash/make-report-full-id/make-report-full-id';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { ReportField } from '#common/types/blockml/parts/report/report-field';
import type { Row } from '#common/types/blockml/parts/report/row/row';

export function makeReport(item: {
  structId: string;
  reportId: string;
  projectId: string;
  creatorId: string;
  filePath: string;
  space: string;
  accessRoles: string[];
  title: string;
  fields: ReportField[];
  rows: Row[];
  chart: MconfigChart;
  draftCreatedTs?: number;
  draft: boolean;
}): ReportTab {
  let {
    structId,
    reportId,
    projectId,
    creatorId,
    filePath,
    space,
    accessRoles,
    title,
    fields,
    rows,
    chart,
    draft,
    draftCreatedTs
  } = item;

  let report: ReportTab = {
    reportFullId: makeReportFullId({
      structId: structId,
      reportId: reportId
    }),
    structId: structId,
    reportId: reportId,
    projectId: projectId,
    creatorId: creatorId,
    draft: draft,
    draftCreatedTs: draftCreatedTs,
    filePath: filePath,
    space: space,
    accessRoles: accessRoles,
    accessRolesCombined: makeAccessRolesCombined({
      accessRoles: accessRoles,
      accessRolesInherited: []
    }),
    title: title,
    fields: fields,
    chart: chart,
    rows: rows,
    keyTag: undefined,
    serverTs: undefined
  };

  return report;
}

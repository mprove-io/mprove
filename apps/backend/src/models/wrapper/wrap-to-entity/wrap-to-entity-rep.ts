import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';

export function wrapToEntityReport(item: {
  report: common.Rep;
  reportFullId?: string;
}): schemaPostgres.ReportEnt {
  let { report, reportFullId } = item;

  return {
    reportFullId: reportFullId || common.makeId(),
    projectId: report.projectId,
    structId: report.structId,
    reportId: report.repId,
    filePath: report.filePath,
    draft: report.draft,
    creatorId: report.creatorId,
    accessUsers: report.accessUsers,
    accessRoles: report.accessRoles,
    title: report.title,
    rows: report.rows,
    draftCreatedTs: report.draftCreatedTs,
    serverTs: report.serverTs
  };
}

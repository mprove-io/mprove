import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getReportAuthor } from '#backend/functions/get-report-author';
import { makeSpaceUnitDisplayAccessRoles } from '#common/functions/space-tree';
import type { Member } from '#common/zod/backend/member';
import type { ReportUnit } from '#common/zod/backend/report-unit';

export function makeReportUnit(item: {
  report: ReportTab;
  member: Member;
  favoriteReportIds: string[];
  space: string | undefined;
  displaySpace: string;
}): ReportUnit {
  let { report, member, favoriteReportIds, space, displaySpace } = item;

  let author = getReportAuthor({ report: report });

  return {
    type: 'reportUnit',
    id: report.reportId,
    reportId: report.reportId,
    title: report.title || report.reportId,
    filePath: report.filePath,
    space: space,
    accessRoles: report.accessRoles,
    accessRolesCombined: report.accessRolesCombined,
    author: author,
    canEditOrDeleteReport:
      member.isEditor === true ||
      member.isAdmin === true ||
      author === member.alias,
    isFavorite: favoriteReportIds.indexOf(report.reportId) > -1,
    draft: report.draft,
    displaySpace: displaySpace,
    displayAccessRoles: makeSpaceUnitDisplayAccessRoles({
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined
    })
  };
}

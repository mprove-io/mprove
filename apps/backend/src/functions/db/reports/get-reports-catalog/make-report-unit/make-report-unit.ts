import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getUnitAuthor } from '#backend/functions/units/get-unit-author/get-unit-author';
import type { Member } from '#common/types/backend/parts/member';
import type { ReportUnit } from '#common/types/backend/parts/report/report-unit';

export function makeReportUnit(item: {
  report: ReportTab;
  member: Member;
  favoriteReportIds: string[];
  space: string | undefined;
  spaceFullTitle: string;
}): ReportUnit {
  let { report, member, favoriteReportIds, space, spaceFullTitle } = item;

  let author: string = getUnitAuthor({
    filePath: report.filePath
  });

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
    spaceFullTitle: spaceFullTitle
  };
}

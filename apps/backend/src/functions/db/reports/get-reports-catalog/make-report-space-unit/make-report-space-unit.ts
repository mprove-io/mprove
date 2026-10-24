import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getUnitAuthor } from '#backend/functions/units/get-unit-author/get-unit-author';
import type { Member } from '#common/types/backend/parts/member';
import type { SpaceUnit } from '#common/types/backend/parts/space-unit';

export function makeReportSpaceUnit(item: {
  report: ReportTab;
  member: Member;
  favoriteReportIds: string[];
}): SpaceUnit {
  let { report, member, favoriteReportIds } = item;

  let author: string = getUnitAuthor({
    filePath: report.filePath
  });

  return {
    type: 'spaceUnit',
    id: report.reportId,
    unitId: report.reportId,
    title: report.title || report.reportId,
    filePath: report.filePath,
    space: report.space,
    accessRoles: report.accessRoles,
    accessRolesCombined: report.accessRolesCombined,
    author: author,
    canEditOrDeleteUnit:
      member.isEditor === true ||
      member.isAdmin === true ||
      author === member.alias,
    isFavorite: favoriteReportIds.indexOf(report.reportId) > -1,
    spaceFullTitle: ''
  };
}

import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getReportAuthor } from '#backend/functions/get-report-author';
import { makeSpaceUnitDisplayAccessRoles } from '#common/functions/space-tree';
import type { Member } from '#common/zod/backend/member';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

export function makeReportSpaceUnit(item: {
  report: ReportTab;
  member: Member;
  favoriteReportIds: string[];
}): SpaceUnit {
  let { report, member, favoriteReportIds } = item;

  let author = getReportAuthor({ report: report });

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
    displaySpace: report.space ?? '',
    displayAccessRoles: makeSpaceUnitDisplayAccessRoles({
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined
    })
  };
}

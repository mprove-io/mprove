import { Injectable } from '@nestjs/common';
import type { ReportTab } from '#backend/drizzle/postgres/schema/_tabs';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { makeDisplayAccessRoles } from '#common/functions/space/make-display-access-roles';
import type { Member } from '#common/zod/backend/member';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

@Injectable()
export class UnitsService {
  getReportAuthor(item: { report: ReportTab }): string | undefined {
    let { report } = item;

    let author: string;

    if (isDefined(report.filePath)) {
      let filePathArray = report.filePath.split('/');

      let usersFolderIndex = filePathArray.findIndex(
        x => x === MPROVE_USERS_FOLDER
      );

      author =
        usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
          ? filePathArray[usersFolderIndex + 1]
          : undefined;
    }

    return author;
  }

  makeReportUnit(item: {
    report: ReportTab;
    member: Member;
    favoriteReportIds: string[];
    space: string | undefined;
    displaySpace: string;
  }): ReportUnit {
    let { report, member, favoriteReportIds, space, displaySpace } = item;

    let author = this.getReportAuthor({ report: report });

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
      displayAccessRoles: makeDisplayAccessRoles({
        accessRoles: report.accessRoles,
        accessRolesCombined: report.accessRolesCombined
      })
    };
  }

  makeReportSpaceUnit(item: {
    report: ReportTab;
    member: Member;
    favoriteReportIds: string[];
  }): SpaceUnit {
    let { report, member, favoriteReportIds } = item;

    let author = this.getReportAuthor({ report: report });

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
      displayAccessRoles: makeDisplayAccessRoles({
        accessRoles: report.accessRoles,
        accessRolesCombined: report.accessRolesCombined
      })
    };
  }
}

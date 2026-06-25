import { Injectable } from '@nestjs/common';
import type {
  DashboardTab,
  ReportTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import { makeDisplayAccessRoles } from '#common/functions/space/make-display-access-roles';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { Member } from '#common/zod/backend/member';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { SpaceUnit } from '#common/zod/backend/space-unit';

@Injectable()
export class UnitsService {
  getUnitAuthor(item: { filePath: string | undefined }): string | undefined {
    let { filePath } = item;

    let author: string | undefined;

    if (isDefined(filePath)) {
      let filePathArray = filePath.split('/');

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

    let author = this.getUnitAuthor({ filePath: report.filePath });

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

    let author = this.getUnitAuthor({ filePath: report.filePath });

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

  makeDashboardUnit(item: {
    dashboard: DashboardTab;
    member: Member;
    favoriteDashboardIds: string[];
    space: string | undefined;
    displaySpace: string;
  }): DashboardUnit {
    let { dashboard, member, favoriteDashboardIds, space, displaySpace } = item;
    let author = this.getUnitAuthor({ filePath: dashboard.filePath });

    return {
      type: 'dashboardUnit',
      id: dashboard.dashboardId,
      dashboardId: dashboard.dashboardId,
      draft: dashboard.draft,
      title: dashboard.title || dashboard.dashboardId,
      filePath: dashboard.filePath,
      space: space,
      accessRoles: dashboard.accessRoles,
      accessRolesCombined: dashboard.accessRolesCombined,
      author: author,
      canEditOrDeleteDashboard:
        member.isEditor === true ||
        member.isAdmin === true ||
        author === member.alias,
      isFavorite: favoriteDashboardIds.indexOf(dashboard.dashboardId) > -1,
      displaySpace: displaySpace,
      displayAccessRoles: makeDisplayAccessRoles({
        accessRoles: dashboard.accessRoles,
        accessRolesCombined: dashboard.accessRolesCombined
      })
    };
  }

  makeDashboardSpaceUnit(item: {
    dashboard: DashboardTab;
    member: Member;
    favoriteDashboardIds: string[];
  }): SpaceUnit {
    let { dashboard, member, favoriteDashboardIds } = item;
    let author = this.getUnitAuthor({ filePath: dashboard.filePath });

    return {
      type: 'spaceUnit',
      id: dashboard.dashboardId,
      unitId: dashboard.dashboardId,
      title: dashboard.title || dashboard.dashboardId,
      filePath: dashboard.filePath,
      space: dashboard.space,
      accessRoles: dashboard.accessRoles,
      accessRolesCombined: dashboard.accessRolesCombined,
      author: author,
      canEditOrDeleteUnit:
        member.isEditor === true ||
        member.isAdmin === true ||
        author === member.alias,
      isFavorite: favoriteDashboardIds.indexOf(dashboard.dashboardId) > -1,
      displaySpace: dashboard.space ?? '',
      displayAccessRoles: makeDisplayAccessRoles({
        accessRoles: dashboard.accessRoles,
        accessRolesCombined: dashboard.accessRolesCombined
      })
    };
  }
}

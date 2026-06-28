import { Injectable } from '@nestjs/common';
import type {
  ChartTab,
  DashboardTab,
  ModelTab,
  ReportTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined';
import type { ChartUnit } from '#common/zod/backend/chart-unit';
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
    spaceFullTitle: string;
  }): ReportUnit {
    let { report, member, favoriteReportIds, space, spaceFullTitle } = item;

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
      spaceFullTitle: spaceFullTitle
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
      spaceFullTitle: ''
    };
  }

  makeDashboardUnit(item: {
    dashboard: DashboardTab;
    member: Member;
    favoriteDashboardIds: string[];
    space: string | undefined;
    spaceFullTitle: string;
  }): DashboardUnit {
    let { dashboard, member, favoriteDashboardIds, space, spaceFullTitle } =
      item;
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
      spaceFullTitle: spaceFullTitle
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
      spaceFullTitle: ''
    };
  }

  makeChartUnit(item: {
    chart: ChartTab;
    model: ModelTab;
    member: Member;
    favoriteChartIds: string[];
    space: string | undefined;
    spaceFullTitle: string;
  }): ChartUnit {
    let { chart, model, member, favoriteChartIds, space, spaceFullTitle } =
      item;

    let author = this.getUnitAuthor({ filePath: chart.filePath });

    return {
      type: 'chartUnit',
      id: chart.chartId,
      chartId: chart.chartId,
      modelId: chart.modelId,
      modelLabel: chart.modelLabel,
      chartType: chart.chartType,
      iconPath: undefined,
      draft: chart.draft,
      title: chart.title || chart.chartId,
      filePath: chart.filePath,
      space: space,
      accessRoles: model.accessRoles,
      accessRolesCombined: model.accessRolesCombined,
      author: author,
      canEditOrDeleteChart:
        member.isEditor === true ||
        member.isAdmin === true ||
        author === member.alias,
      isFavorite: favoriteChartIds.indexOf(chart.chartId) > -1,
      spaceFullTitle: spaceFullTitle
    };
  }

  makeChartSpaceUnit(item: {
    chart: ChartTab;
    model: ModelTab;
    member: Member;
    favoriteChartIds: string[];
  }): SpaceUnit {
    let { chart, model, member, favoriteChartIds } = item;

    let author = this.getUnitAuthor({ filePath: chart.filePath });
    let space = author === member.alias ? undefined : model.space;

    return {
      type: 'spaceUnit',
      id: chart.chartId,
      unitId: chart.chartId,
      title: chart.title || chart.chartId,
      filePath: chart.filePath,
      space: space,
      accessRoles: model.accessRoles,
      accessRolesCombined: model.accessRolesCombined,
      author: author,
      canEditOrDeleteUnit:
        member.isEditor === true ||
        member.isAdmin === true ||
        author === member.alias,
      isFavorite: favoriteChartIds.indexOf(chart.chartId) > -1,
      spaceFullTitle: '',
      modelId: chart.modelId,
      modelLabel: chart.modelLabel,
      chartType: chart.chartType,
      iconPath: undefined
    };
  }
}

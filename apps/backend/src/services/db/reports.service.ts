import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq, or } from 'drizzle-orm';
import { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { checkAccess } from '#backend/functions/check-access';
import { makeReportFiltersX } from '#backend/functions/make-report-filters-x';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import { EMPTY_REPORT_ID, MPROVE_USERS_FOLDER } from '#common/constants/top';
import { ChartTypeEnum } from '#common/enums/chart/chart-type.enum';
import { ErEnum } from '#common/enums/er.enum';
import { FavoriteTypeEnum } from '#common/enums/favorite-type.enum';
import { TimeSpecEnum } from '#common/enums/timespec.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import { ServerError } from '#common/models/server-error';
import type { Member } from '#common/zod/backend/member';
import type { ModelX } from '#common/zod/backend/model-x';
import type { ReportUnit } from '#common/zod/backend/report-unit';
import type { ReportX } from '#common/zod/backend/report-x';
import type { SpaceNode } from '#common/zod/backend/space-node';
import type { Column } from '#common/zod/blockml/column';
import type { Fraction } from '#common/zod/blockml/fraction';
import type { MconfigChart } from '#common/zod/blockml/mconfig-chart';
import type { Report } from '#common/zod/blockml/report';
import type { ReportField } from '#common/zod/blockml/report-field';
import type { Row } from '#common/zod/blockml/row';
import type { Space } from '#common/zod/blockml/space';
import { HashService } from '../hash.service';
import { SpaceService } from '../space.service';
import { TabService } from '../tab.service';
import { UnitsService } from '../units.service';
import { FavoritesService } from './favorites.service';

@Injectable()
export class ReportsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private favoritesService: FavoritesService,
    private spaceService: SpaceService,
    private unitsService: UnitsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getReportsCatalog(item: {
    projectId: string;
    structId: string;
    user: UserTab;
    userMember: MemberTab;
    apiUserMember: Member;
    spaces: Space[];
  }): Promise<{
    reportUnitDrafts: ReportUnit[];
    reportSpaceNodes: SpaceNode[];
  }> {
    let { projectId, structId, user, userMember, apiUserMember, spaces } = item;

    let reports = await this.db.drizzle.query.reportsTable
      .findMany({
        where: and(
          eq(reportsTable.structId, structId),
          or(
            eq(reportsTable.draft, false),
            and(
              eq(reportsTable.draft, true),
              eq(reportsTable.creatorId, user.userId)
            )
          )
        )
      })
      .then(xs => xs.map(x => this.tabService.reportEntToTab(x)));

    let draftReports = reports.filter(x => x.draft === true);

    let savedReports = reports.filter(x => x.draft === false);

    let reportsGrantedAccess = savedReports.filter(x =>
      checkAccess({
        member: userMember,
        accessRoles: x.accessRolesCombined,
        filePath: x.filePath
      })
    );

    let sortedDraftReports = draftReports
      .sort((a, b) =>
        a.draftCreatedTs > b.draftCreatedTs
          ? 1
          : b.draftCreatedTs > a.draftCreatedTs
            ? -1
            : 0
      )
      .reverse();

    let sortedNonDraftReports = reportsGrantedAccess.sort((a, b) => {
      let aTitle = a.title.toLowerCase() || a.reportId.toLowerCase();
      let bTitle = b.title.toLowerCase() || b.reportId.toLowerCase();

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    let reportTargetIds = sortedNonDraftReports.map(report => report.reportId);

    let favoriteReportIds = await this.favoritesService.getFavoriteTargetIds({
      projectId: projectId,
      userId: user.userId,
      type: FavoriteTypeEnum.Report,
      targetIds: reportTargetIds
    });

    let reportSpaceUnits = sortedNonDraftReports.map(report =>
      this.unitsService.makeReportSpaceUnit({
        report: report,
        member: apiUserMember,
        favoriteReportIds: favoriteReportIds
      })
    );

    let reportSpaceNodes = this.spaceService.makeSpaceNodes({
      spaces: spaces ?? [],
      units: reportSpaceUnits,
      member: apiUserMember
    });

    return {
      reportUnitDrafts: sortedDraftReports.map(x =>
        this.unitsService.makeReportUnit({
          report: x,
          member: apiUserMember,
          favoriteReportIds: [],
          space: x.space,
          displaySpace: x.space ?? ''
        })
      ),
      reportSpaceNodes: reportSpaceNodes
    };
  }

  makeReport(item: {
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
      reportFullId: this.hashService.makeReportFullId({
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
      accessRolesCombined: accessRoles,
      title: title,
      fields: fields,
      chart: chart,
      rows: rows,
      keyTag: undefined,
      serverTs: undefined
    };

    return report;
  }

  tabToApi(item: {
    report: ReportTab;
    member: Member;
    models: ModelX[];
    timezone: string;
    timeSpec: TimeSpecEnum;
    timeRangeFraction: Fraction;
    rangeStart: number;
    rangeEnd: number;
    timeColumnsLimit: number;
    columns: Column[];
    timeColumnsLength: number;
    isTimeColumnsLimitExceeded: boolean;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateExcludedYYYYMMDD: string;
    metricsEndDateIncludedYYYYMMDD: string;
  }): ReportX {
    let {
      report,
      member,
      columns,
      timezone,
      timeSpec,
      models,
      timeRangeFraction,
      rangeStart,
      rangeEnd,
      timeColumnsLimit,
      timeColumnsLength,
      isTimeColumnsLimitExceeded,
      metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD
    } = item;

    let author;

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

    let canEditOrDeleteRep =
      member.isEditor || member.isAdmin || author === member.alias;

    let reportExtendedFilters = makeReportFiltersX({ report: report });

    let apiReport: ReportX = {
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      canEditOrDeleteReport: canEditOrDeleteRep,
      author: author,
      draft: report.draft,
      creatorId: report.creatorId,
      filePath: report.filePath,
      space: report.space,
      accessRoles: report.accessRoles,
      accessRolesCombined: report.accessRolesCombined,
      title: report.title,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
      fields: report.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: reportExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      rows: report.rows.map(x => {
        x.hasAccessToModel = isDefined(x.mconfig)
          ? models.find(m => m.modelId === x.mconfig.modelId).hasAccess
          : false;
        return x;
      }),
      columns: columns,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: timeColumnsLength,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
      chart: report.chart,
      draftCreatedTs: Number(report.draftCreatedTs),
      serverTs: Number(report.serverTs)
    };

    return apiReport;
  }

  apiToTab(item: { apiReport: Report }): ReportTab {
    let { apiReport } = item;

    if (isUndefined(apiReport)) {
      return;
    }

    let report: ReportTab = {
      reportFullId: this.hashService.makeReportFullId({
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

  async getReportCheckExists(item: { reportId: string; structId: string }) {
    let { reportId, structId } = item;

    let report = await this.db.drizzle.query.reportsTable
      .findFirst({
        where: and(
          eq(reportsTable.structId, structId),
          eq(reportsTable.reportId, reportId)
        )
      })
      .then(x => this.tabService.reportEntToTab(x));

    if (isUndefined(report)) {
      throw new ServerError({
        message: ErEnum.BACKEND_REPORT_DOES_NOT_EXIST
      });
    }

    return report;
  }

  async getReportCheckExistsAndAccess(item: {
    projectId: string;
    reportId: string;
    structId: string;
    user: UserTab;
    userMember: MemberTab | Member;
  }) {
    let { projectId, reportId, structId, user, userMember } = item;

    let chart = makeCopy(DEFAULT_CHART);

    chart.type = ChartTypeEnum.Line;

    let emptyReport = this.makeReport({
      structId: undefined,
      reportId: reportId,
      projectId: projectId,
      creatorId: undefined,
      filePath: undefined,
      space: undefined,
      accessRoles: [],
      title: reportId,
      fields: [],
      rows: [],
      chart: chart,
      draft: false
    });

    let report =
      reportId === EMPTY_REPORT_ID
        ? emptyReport
        : await this.db.drizzle.query.reportsTable
            .findFirst({
              where: and(
                eq(reportsTable.projectId, projectId),
                eq(reportsTable.structId, structId),
                eq(reportsTable.reportId, reportId)
              )
            })
            .then(x => this.tabService.reportEntToTab(x));

    if (isUndefined(report)) {
      throw new ServerError({
        message: ErEnum.BACKEND_REPORT_NOT_FOUND
      });
    }

    if (
      reportId !== EMPTY_REPORT_ID &&
      report.draft === true &&
      report.creatorId !== user.userId
    ) {
      throw new ServerError({
        message: ErEnum.BACKEND_REPORT_CREATOR_ID_MISMATCH
      });
    }

    if (report.draft === false) {
      let isAccessGranted = checkAccess({
        member: userMember,
        accessRoles: report.accessRolesCombined,
        filePath: report.filePath
      });

      if (isAccessGranted === false) {
        throw new ServerError({
          message: ErEnum.BACKEND_FORBIDDEN_REPORT
        });
      }
    }

    return report;
  }
}

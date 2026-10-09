import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Result } from '@praha/byethrow';
import { and, eq, or } from 'drizzle-orm';
import type { BackendConfig } from '#backend/config/backend-config';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  MemberTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { FavoritesService } from '#backend/services/db/favorites/favorites.service';
import { makeReportFiltersX } from '#backend/services/db/reports/make-report-filters-x/make-report-filters-x';
import { HashService } from '#backend/services/hash/hash.service';
import { SpaceService } from '#backend/services/space/space.service';
import { TabService } from '#backend/services/tab/tab.service';
import { UnitsService } from '#backend/services/units/units.service';
import { ServerError } from '#common/classes/server-error/server-error';
import { DEFAULT_CHART } from '#common/constants/mconfig-chart';
import {
  EMPTY_REPORT_ID,
  MPROVE_USERS_FOLDER,
  MY_REPORTS_SPACE_TITLE
} from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import { isUndefined } from '#common/functions/is-undefined/is-undefined';
import { makeAccessRolesCombined } from '#common/functions/make-access-roles-combined/make-access-roles-combined';
import { makeCopy } from '#common/functions/make-copy/make-copy';
import type { GetReportCheckExistsAndAccessResultError } from '#common/types/backend/function-errors/get-report-check-exists-and-access-result-error';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ReportUnit } from '#common/types/backend/parts/report/report-unit';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { SpaceNode } from '#common/types/backend/parts/space-node';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { Column } from '#common/types/blockml/parts/report/column';
import type { Report } from '#common/types/blockml/parts/report/report';
import type { ReportField } from '#common/types/blockml/parts/report/report-field';
import type { Row } from '#common/types/blockml/parts/report/row/row';
import type { Space } from '#common/types/blockml/parts/space';
import type { TimeSpec } from '#common/types/shared/time/timespec';

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
      type: 'Report',
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
      member: apiUserMember,
      mySpaceTitle: MY_REPORTS_SPACE_TITLE
    });

    return {
      reportUnitDrafts: sortedDraftReports.map(x =>
        this.unitsService.makeReportUnit({
          report: x,
          member: apiUserMember,
          favoriteReportIds: [],
          space: x.space,
          spaceFullTitle: x.space
            ? spaces.find(space => space.space === x.space)?.fullTitle
            : ''
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

  tabToApi(item: {
    report: ReportTab;
    member: Member;
    models: ModelX[];
    timezone: string;
    timeSpec: TimeSpec;
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
        message: 'BACKEND_REPORT_DOES_NOT_EXIST'
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
  }): Promise<ReportTab> {
    let result: Result.Result<
      ReportTab,
      GetReportCheckExistsAndAccessResultError
    > = await this.getReportCheckExistsAndAccessResult(item);

    if (Result.isFailure(result)) {
      throw new ServerError({ message: result.error.code });
    }

    let report: ReportTab = result.value;

    return report;
  }

  async getReportCheckExistsAndAccessResult(item: {
    projectId: string;
    reportId: string;
    structId: string;
    user: UserTab;
    userMember: MemberTab | Member;
  }): Result.ResultAsync<ReportTab, GetReportCheckExistsAndAccessResultError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind(
        'report',
        async (
          v
        ): Result.ResultAsync<
          ReportTab,
          GetReportCheckExistsAndAccessResultError
        > => {
          let chart: MconfigChart = makeCopy(DEFAULT_CHART);

          chart.type = 'line';

          let emptyReport: ReportTab = this.makeReport({
            structId: undefined,
            reportId: v.reportId,
            projectId: v.projectId,
            creatorId: undefined,
            filePath: undefined,
            space: undefined,
            accessRoles: [],
            title: v.reportId,
            fields: [],
            rows: [],
            chart: chart,
            draft: false
          });

          if (v.reportId === EMPTY_REPORT_ID) {
            return Result.succeed(emptyReport);
          }

          return this.db.drizzle.query.reportsTable
            .findFirst({
              where: and(
                eq(reportsTable.projectId, v.projectId),
                eq(reportsTable.structId, v.structId),
                eq(reportsTable.reportId, v.reportId)
              )
            })
            .then(reportEnt =>
              isUndefined(reportEnt)
                ? Result.fail({ code: 'BACKEND_REPORT_NOT_FOUND' })
                : this.tabService.reportEntToTabResult({ reportEnt: reportEnt })
            );
        }
      ),
      Result.andThrough(v => {
        if (
          v.reportId !== EMPTY_REPORT_ID &&
          v.report.draft === true &&
          v.report.creatorId !== v.user.userId
        ) {
          return Result.fail({ code: 'BACKEND_REPORT_CREATOR_ID_MISMATCH' });
        }

        return Result.succeed();
      }),
      Result.andThrough(v => {
        if (v.report.draft === false) {
          let isAccessGranted: boolean = checkAccess({
            member: v.userMember,
            accessRoles: v.report.accessRolesCombined,
            filePath: v.report.filePath
          });

          if (isAccessGranted === false) {
            return Result.fail({ code: 'BACKEND_FORBIDDEN_REPORT' });
          }
        }

        return Result.succeed();
      }),
      Result.map((v): ReportTab => v.report)
    );
  }
}

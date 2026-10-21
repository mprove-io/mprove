import { Injectable } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import { and, eq, or } from 'drizzle-orm';
import type {
  MemberTab,
  ReportTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { reportsTable } from '#backend/drizzle/postgres/schema/reports';
import { checkAccess } from '#backend/functions/check-access/check-access';
import { DbService } from '#backend/services/db/db.service';
import { FavoritesService } from '#backend/services/db/favorites/favorites.service';
import { makeReportFiltersX } from '#backend/services/db/reports/make-report-filters-x/make-report-filters-x';
import { HashService } from '#backend/services/hash/hash.service';
import { SpaceService } from '#backend/services/space/space.service';
import { UnitsService } from '#backend/services/units/units.service';
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
import type { GetReportCheckExistsAndAccessError } from '#common/types/backend/function-errors/get-report-check-exists-and-access-error';
import type { GetReportsCatalogError } from '#common/types/backend/function-errors/get-reports-catalog-error';
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

export type ReportsCatalog = {
  reportUnitDrafts: ReportUnit[];
  reportSpaceNodes: SpaceNode[];
};

@Injectable()
export class ReportsService {
  constructor(
    private hashService: HashService,
    private favoritesService: FavoritesService,
    private spaceService: SpaceService,
    private unitsService: UnitsService,
    private db: DbService
  ) {}

  async getReportsCatalog(item: {
    projectId: string;
    structId: string;
    user: UserTab;
    userMember: MemberTab;
    apiUserMember: Member;
    spaces: Space[];
  }): Result.ResultAsync<ReportsCatalog, GetReportsCatalogError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('reports', v =>
        this.db.reports.findMany({
          where: and(
            eq(reportsTable.structId, v.structId),
            or(
              eq(reportsTable.draft, false),
              and(
                eq(reportsTable.draft, true),
                eq(reportsTable.creatorId, v.user.userId)
              )
            )
          )
        })
      ),
      Result.bind('draftReports', v =>
        Result.succeed(v.reports.filter(report => report.draft === true))
      ),
      Result.bind('savedReports', v =>
        Result.succeed(v.reports.filter(report => report.draft === false))
      ),
      Result.bind('reportsGrantedAccess', v =>
        Result.succeed(
          v.savedReports.filter(report =>
            checkAccess({
              member: v.userMember,
              accessRoles: report.accessRolesCombined,
              filePath: report.filePath
            })
          )
        )
      ),
      Result.bind('sortedDraftReports', v =>
        Result.succeed(
          v.draftReports
            .sort((a, b) =>
              a.draftCreatedTs > b.draftCreatedTs
                ? 1
                : b.draftCreatedTs > a.draftCreatedTs
                  ? -1
                  : 0
            )
            .reverse()
        )
      ),
      Result.bind('sortedNonDraftReports', v =>
        Result.succeed(
          v.reportsGrantedAccess.sort((a, b) => {
            let aTitle: string =
              a.title.toLowerCase() || a.reportId.toLowerCase();

            let bTitle: string =
              b.title.toLowerCase() || b.reportId.toLowerCase();

            return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
          })
        )
      ),
      Result.bind('reportTargetIds', v =>
        Result.succeed(v.sortedNonDraftReports.map(report => report.reportId))
      ),
      Result.bind('favoriteReportIds', v =>
        this.favoritesService
          .getFavoriteTargetIds({
            projectId: v.projectId,
            userId: v.user.userId,
            type: 'Report',
            targetIds: v.reportTargetIds
          })
          .then(ids => Result.succeed(ids))
      ),
      Result.bind('reportSpaceUnits', v =>
        Result.succeed(
          v.sortedNonDraftReports.map(report =>
            this.unitsService.makeReportSpaceUnit({
              report: report,
              member: v.apiUserMember,
              favoriteReportIds: v.favoriteReportIds
            })
          )
        )
      ),
      Result.bind('reportSpaceNodes', v =>
        Result.succeed(
          this.spaceService.makeSpaceNodes({
            spaces: v.spaces ?? [],
            units: v.reportSpaceUnits,
            member: v.apiUserMember,
            mySpaceTitle: MY_REPORTS_SPACE_TITLE
          })
        )
      ),
      Result.map(
        (v): ReportsCatalog => ({
          reportUnitDrafts: v.sortedDraftReports.map(report =>
            this.unitsService.makeReportUnit({
              report: report,
              member: v.apiUserMember,
              favoriteReportIds: [],
              space: report.space,
              spaceFullTitle: report.space
                ? v.spaces.find(space => space.space === report.space)
                    ?.fullTitle
                : ''
            })
          ),
          reportSpaceNodes: v.reportSpaceNodes
        })
      )
    );
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

  async getReportCheckExistsAndAccess(item: {
    projectId: string;
    reportId: string;
    structId: string;
    user: UserTab;
    userMember: MemberTab | Member;
  }): Result.ResultAsync<ReportTab, GetReportCheckExistsAndAccessError> {
    return Result.pipe(
      Result.succeed(item),
      Result.bind('report', async v => {
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

        return this.db.reports.findFirstCheckExists({
          where: and(
            eq(reportsTable.projectId, v.projectId),
            eq(reportsTable.structId, v.structId),
            eq(reportsTable.reportId, v.reportId)
          )
        });
      }),
      Result.andThrough(v =>
        v.reportId !== EMPTY_REPORT_ID &&
        v.report.draft === true &&
        v.report.creatorId !== v.user.userId
          ? Result.fail({ code: 'BACKEND_REPORT_CREATOR_ID_MISMATCH' })
          : Result.succeed()
      ),
      Result.andThrough(v =>
        v.report.draft === false &&
        checkAccess({
          member: v.userMember,
          accessRoles: v.report.accessRolesCombined,
          filePath: v.report.filePath
        }) === false
          ? Result.fail({ code: 'BACKEND_FORBIDDEN_REPORT' })
          : Result.succeed()
      ),
      Result.map((v): ReportTab => v.report)
    );
  }
}

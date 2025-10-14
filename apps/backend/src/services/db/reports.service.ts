import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import {
  MemberTab,
  ReportTab,
  UserTab
} from '~backend/drizzle/postgres/schema/_tabs';
import { reportsTable } from '~backend/drizzle/postgres/schema/reports';
import { checkAccess } from '~backend/functions/check-access';
import { makeReportFiltersX } from '~backend/functions/make-report-filters-x';
import { DEFAULT_CHART } from '~common/constants/mconfig-chart';
import { EMPTY_REPORT_ID } from '~common/constants/top';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { ChartTypeEnum } from '~common/enums/chart/chart-type.enum';
import { ErEnum } from '~common/enums/er.enum';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { makeCopy } from '~common/functions/make-copy';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Column } from '~common/interfaces/blockml/column';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { Report } from '~common/interfaces/blockml/report';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { ServerError } from '~common/models/server-error';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

let retry = require('async-retry');

@Injectable()
export class ReportsService {
  constructor(
    private tabService: TabService,
    private hashService: HashService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  makeReport(item: {
    structId: string;
    reportId: string;
    projectId: string;
    creatorId: string;
    filePath: string;
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
      accessRoles: accessRoles,
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
      accessRoles: report.accessRoles,
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
      fields: apiReport.fields,
      accessRoles: apiReport.accessRoles,
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

  checkRepPath(item: { filePath: string; userAlias: string }) {
    if (item.filePath.split('/')[2] !== item.userAlias) {
      throw new ServerError({
        message: ErEnum.BACKEND_FORBIDDEN_REPORT_PATH
      });
    }
  }

  async getReport(item: {
    projectId: string;
    reportId: string;
    structId: string;
    user: UserTab;
    userMember: MemberTab;
    isCheckExist: boolean;
    isCheckAccess: boolean;
  }) {
    let {
      projectId,
      reportId,
      structId,
      isCheckExist,
      isCheckAccess,
      user,
      userMember
    } = item;

    let chart = makeCopy(DEFAULT_CHART);

    chart.type = ChartTypeEnum.Line;

    let emptyReport = this.makeReport({
      structId: undefined,
      reportId: reportId,
      projectId: projectId,
      creatorId: undefined,
      filePath: undefined,
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

    if (isCheckExist === true && isUndefined(report)) {
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
        message: ErEnum.BACKEND_DRAFT_REPORT_IS_AVAILABLE_ONLY_TO_ITS_CREATOR
      });
    }

    if (isCheckAccess === true && report.draft === false) {
      let isAccessGranted = checkAccess({
        member: userMember,
        accessRoles: report.accessRoles
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

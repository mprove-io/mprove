import { Injectable } from '@nestjs/common';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import {
  ReportLt,
  ReportSt,
  ReportTab
} from '~backend/drizzle/postgres/tabs/report-tab';
import { makeReportFiltersX } from '~backend/functions/make-report-filters-x';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { TimeSpecEnum } from '~common/enums/timespec.enum';
import { isDefined } from '~common/functions/is-defined';
import { Member } from '~common/interfaces/backend/member';
import { ModelX } from '~common/interfaces/backend/model-x';
import { ReportX } from '~common/interfaces/backend/report-x';
import { Column } from '~common/interfaces/blockml/column';
import { Fraction } from '~common/interfaces/blockml/fraction';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
import { Report } from '~common/interfaces/blockml/report';
import { ReportField } from '~common/interfaces/blockml/report-field';
import { Row } from '~common/interfaces/blockml/row';
import { HashService } from '../hash.service';
import { TabService } from '../tab.service';

@Injectable()
export class WrapReportService {
  constructor(
    private tabService: TabService,
    private hashService: HashService
  ) {}

  makeReportEnt(item: {
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
  }): ReportEnt {
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

    let reportSt: ReportSt = {
      filePath: filePath,
      accessRoles: accessRoles,
      title: title,
      fields: fields,
      chart: chart
    };

    let reportLt: ReportLt = {
      rows: rows
    };

    let report: ReportEnt = {
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
      st: this.tabService.encrypt({ data: reportSt }),
      lt: this.tabService.encrypt({ data: reportLt }),
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

    if (isDefined(report.st.filePath)) {
      let filePathArray = report.st.filePath.split('/');

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
      filePath: report.st.filePath,
      accessRoles: report.st.accessRoles,
      title: report.st.title,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
      fields: report.st.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: reportExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      rows: report.lt.rows.map(x => {
        x.hasAccessToModel = isDefined(x.mconfig)
          ? models.find(m => m.modelId === x.mconfig.modelId).hasAccess
          : false;
        return x;
      }),
      columns: columns,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: timeColumnsLength,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
      chart: report.st.chart,
      draftCreatedTs: Number(report.draftCreatedTs),
      serverTs: Number(report.serverTs)
    };

    return apiReport;
  }

  apiToTab(item: { report: Report }): ReportTab {
    let { report } = item;

    let reportSt: ReportSt = {
      filePath: report.filePath,
      fields: report.fields,
      accessRoles: report.accessRoles,
      title: report.title,
      chart: report.chart
    };

    let reportLt: ReportLt = {
      rows: report.rows
    };

    let reportTab: ReportTab = {
      reportFullId: this.hashService.makeReportFullId({
        structId: report.structId,
        reportId: report.reportId
      }),
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      creatorId: report.creatorId,
      draft: report.draft,
      draftCreatedTs: report.draftCreatedTs,
      st: reportSt,
      lt: reportLt,
      serverTs: report.serverTs
    };

    return reportTab;
  }

  tabToEnt(report: ReportTab): ReportEnt {
    let reportEnt: ReportEnt = {
      ...report,
      st: this.tabService.encrypt({ data: report.st }),
      lt: this.tabService.encrypt({ data: report.lt })
    };

    return reportEnt;
  }

  entToTab(report: ReportEnt): ReportTab {
    let reportTab: ReportTab = {
      ...report,
      st: this.tabService.decrypt<ReportSt>({
        encryptedString: report.st
      }),
      lt: this.tabService.decrypt<ReportLt>({
        encryptedString: report.lt
      })
    };

    return reportTab;
  }
}

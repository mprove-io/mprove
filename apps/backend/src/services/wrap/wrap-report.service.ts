import { Injectable } from '@nestjs/common';
import { ReportEnt } from '~backend/drizzle/postgres/schema/reports';
import { ReportTab } from '~backend/drizzle/postgres/tabs/report-tab';
import { MconfigChart } from '~common/interfaces/blockml/mconfig-chart';
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

  wrapToApiReport(item: {
    report: ReportEnt;
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

    let reportTab = this.tabService.decrypt<ReportTab>({
      encryptedString: report.tab
    });

    let author;
    if (isDefined(reportTab.filePath)) {
      let filePathArray = reportTab.filePath.split('/');

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

    let reportExtendedFilters = makeReportFiltersX(report);

    let apiReport: ReportX = {
      projectId: report.projectId,
      structId: report.structId,
      reportId: report.reportId,
      canEditOrDeleteReport: canEditOrDeleteRep,
      author: author,
      draft: report.draft,
      creatorId: report.creatorId,
      filePath: reportTab.filePath,
      accessRoles: reportTab.accessRoles,
      title: reportTab.title,
      timezone: timezone,
      timeSpec: timeSpec,
      timeRangeFraction: timeRangeFraction,
      rangeStart: rangeStart,
      rangeEnd: rangeEnd,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateExcludedYYYYMMDD: metricsEndDateExcludedYYYYMMDD,
      metricsEndDateIncludedYYYYMMDD: metricsEndDateIncludedYYYYMMDD,
      fields: reportTab.fields.sort((a, b) => {
        let labelA = a.label.toUpperCase();
        let labelB = b.label.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      extendedFilters: reportExtendedFilters.sort((a, b) => {
        let labelA = a.fieldId.toUpperCase();
        let labelB = b.fieldId.toUpperCase();
        return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
      }),
      rows: reportTab.rows.map(x => {
        x.hasAccessToModel = isDefined(x.mconfig)
          ? models.find(m => m.modelId === x.mconfig.modelId).hasAccess
          : false;
        return x;
      }),
      columns: columns,
      timeColumnsLimit: timeColumnsLimit,
      timeColumnsLength: timeColumnsLength,
      isTimeColumnsLimitExceeded: isTimeColumnsLimitExceeded,
      chart: reportTab.chart,
      draftCreatedTs: Number(report.draftCreatedTs),
      serverTs: Number(report.serverTs)
    };

    return apiReport;
  }

  wrapToEntityReport(item: { report: Report }): ReportEnt {
    let { report } = item;

    let reportTab: ReportTab = {
      filePath: report.filePath,
      fields: report.fields,
      accessRoles: report.accessRoles,
      title: report.title,
      rows: report.rows,
      chart: report.chart
    };

    let reportEnt: ReportEnt = {
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
      tab: this.tabService.encrypt({ data: reportTab }),
      serverTs: report.serverTs
    };

    return reportEnt;
  }

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

    let reportTab: ReportTab = {
      filePath: filePath,
      accessRoles: accessRoles,
      title: title,
      fields: fields,
      rows: rows,
      chart: chart
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
      tab: this.tabService.encrypt({ data: reportTab }),
      serverTs: undefined
    };

    return report;
  }
}

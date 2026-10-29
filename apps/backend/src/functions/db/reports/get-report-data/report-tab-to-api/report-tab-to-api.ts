import type { ReportTab } from '#backend/drizzle/postgres/tables/reports';
import { makeReportFiltersX } from '#backend/functions/db/reports/get-report-data/report-tab-to-api/make-report-filters-x/make-report-filters-x';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { FilterX } from '#common/types/backend/parts/filter/filter-x';
import type { Member } from '#common/types/backend/parts/member';
import type { ModelX } from '#common/types/backend/parts/model/model-x';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { Fraction } from '#common/types/blockml/parts/fraction/fraction';
import type { Column } from '#common/types/blockml/parts/report/column';
import type { TimeSpec } from '#common/types/shared/time/timespec';

export function reportTabToApi(item: {
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
    let filePathArray: string[] = report.filePath.split('/');

    let usersFolderIndex: number = filePathArray.findIndex(
      x => x === MPROVE_USERS_FOLDER
    );

    author =
      usersFolderIndex > -1 && filePathArray.length > usersFolderIndex + 1
        ? filePathArray[usersFolderIndex + 1]
        : undefined;
  }

  let canEditOrDeleteRep =
    member.isEditor || member.isAdmin || author === member.alias;

  let reportExtendedFilters: FilterX[] = makeReportFiltersX({
    report: report
  });

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
      let labelA: string = a.label.toUpperCase();

      let labelB: string = b.label.toUpperCase();

      return labelA < labelB ? -1 : labelA > labelB ? 1 : 0;
    }),
    extendedFilters: reportExtendedFilters.sort((a, b) => {
      let labelA: string = a.fieldId.toUpperCase();

      let labelB: string = b.fieldId.toUpperCase();

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

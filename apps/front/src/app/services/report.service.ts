import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { ReportX } from '#common/interfaces/backend/report-x';
import { Listener } from '#common/interfaces/blockml/listener';
import { MconfigChart } from '#common/interfaces/blockml/mconfig-chart';
import { ReportField } from '#common/interfaces/blockml/report-field';
import { RowChange } from '#common/interfaces/blockml/row-change';
import {
  ToBackendCreateDraftReportRequestPayload,
  ToBackendCreateDraftReportResponse
} from '#common/interfaces/to-backend/reports/to-backend-create-draft-report';
import {
  ToBackendDeleteDraftReportsRequestPayload,
  ToBackendDeleteDraftReportsResponse
} from '#common/interfaces/to-backend/reports/to-backend-delete-draft-reports';
import {
  ToBackendEditDraftReportRequestPayload,
  ToBackendEditDraftReportResponse
} from '#common/interfaces/to-backend/reports/to-backend-edit-draft-report';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ReportQuery } from '../queries/report.query';
import { ReportsQuery } from '../queries/reports.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(
    private apiService: ApiService,
    private uiQuery: UiQuery,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private memberQuery: MemberQuery,
    private structQuery: StructQuery,
    private reportQuery: ReportQuery,
    private reportsQuery: ReportsQuery
  ) {
    this.nav$.subscribe();
  }

  modifyRows(item: {
    report: ReportX;
    changeType: ChangeTypeEnum;
    rowChange: RowChange;
    rowIds: string[];
    reportFields: ReportField[];
    listeners?: Listener[];
    chart: MconfigChart;
  }) {
    let {
      report,
      changeType,
      rowChange,
      rowIds,
      reportFields,
      listeners,
      chart
    } = item;

    let newChart = isDefined(chart) ? chart : report.chart;

    if (report.draft === true) {
      this.editDraftReport({
        reportId: report.reportId,
        changeType: changeType,
        rowIds: rowIds,
        rowChange: rowChange,
        fields: reportFields,
        listeners: listeners,
        chart: newChart
      });
    } else {
      this.navCreateDraftReport({
        fromReportId: report.reportId,
        changeType: changeType,
        rowChange: rowChange,
        rowIds: rowIds,
        fields: reportFields,
        listeners: listeners,
        chart: newChart
      });
    }
  }

  navCreateDraftReport(item: {
    changeType: ChangeTypeEnum;
    rowChange: RowChange;
    rowIds: string[];
    fromReportId: string;
    fields: ReportField[];
    listeners: Listener[];
    chart: MconfigChart;
  }) {
    this.spinner.show(APP_SPINNER_NAME);

    let {
      rowChange,
      rowIds,
      fromReportId,
      changeType,
      fields,
      listeners,
      chart
    } = item;

    let uiState = this.uiQuery.getValue();

    let payload: ToBackendCreateDraftReportRequestPayload = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fromReportId: fromReportId,
      rowChange: rowChange,
      rowIds: rowIds,
      changeType: changeType,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick,
      newReportFields: fields,
      listeners: listeners,
      chart: chart
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendCreateDraftReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let report = resp.payload.report;

            let reports = this.reportsQuery.getValue().reports;
            let newReports = [report, ...reports];

            this.reportsQuery.update({ reports: newReports });

            this.navigateService.navigateToReport({
              reportId: report.reportId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  editDraftReport(item: {
    changeType: ChangeTypeEnum;
    rowChange: RowChange;
    rowIds: string[];
    reportId: string;
    fields: ReportField[];
    listeners: Listener[];
    chart: MconfigChart;
  }) {
    let { rowChange, rowIds, reportId, changeType, fields, listeners, chart } =
      item;

    let uiState = this.uiQuery.getValue();

    let payload: ToBackendEditDraftReportRequestPayload = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      reportId: reportId,
      changeType: changeType,
      rowChange: rowChange,
      rowIds: rowIds,
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick,
      newReportFields: fields,
      listeners: listeners,
      chart: chart
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendEditDraftReport,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditDraftReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            this.structQuery.update(resp.payload.struct);
            this.navQuery.updatePart({
              needValidate: resp.payload.needValidate
            });

            this.reportQuery.update(resp.payload.report);

            return true;
          }
        }),
        take(1)
      )
      .subscribe();
  }

  deleteDraftReports(item: { reportIds: string[] }) {
    let { reportIds } = item;

    let report = this.reportQuery.getValue();

    let payload: ToBackendDeleteDraftReportsRequestPayload = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      reportIds: reportIds
    };

    this.apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteDraftReportsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let reports = this.reportsQuery.getValue().reports;

            let newReports = [...reports];

            reportIds.forEach(reportId => {
              let repIndex = newReports.findIndex(x => x.reportId === reportId);

              newReports = [
                ...newReports.slice(0, repIndex),
                ...newReports.slice(repIndex + 1)
              ];
            });

            this.reportsQuery.update({ reports: newReports });

            if (reportIds.indexOf(report.reportId) > -1) {
              this.reportQuery.reset();
              this.navigateService.navigateToReports();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}

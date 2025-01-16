import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
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
    report: common.ReportX;
    changeType: common.ChangeTypeEnum;
    rowChange: common.RowChange;
    rowIds: string[];
    reportFields: common.ReportField[];
    chart: common.MconfigChart;
  }) {
    let { report, changeType, rowChange, rowIds, reportFields, chart } = item;

    let newChart = common.isDefined(chart) ? chart : report.chart;

    if (report.draft === true) {
      this.editDraftReport({
        reportId: report.reportId,
        changeType: changeType,
        rowIds: rowIds,
        rowChange: rowChange,
        fields: reportFields,
        chart: newChart
      });
    } else {
      this.navCreateDraftReport({
        fromReportId: report.reportId,
        changeType: changeType,
        rowChange: rowChange,
        rowIds: rowIds,
        fields: reportFields,
        chart: newChart
      });
    }
  }

  navCreateDraftReport(item: {
    changeType: common.ChangeTypeEnum;
    rowChange: common.RowChange;
    rowIds: string[];
    fromReportId: string;
    fields: common.ReportField[];
    chart: common.MconfigChart;
  }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { rowChange, rowIds, fromReportId, changeType, fields, chart } = item;

    let uiState = this.uiQuery.getValue();

    let payload: apiToBackend.ToBackendCreateDraftReportRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
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
      chart: chart
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDraftReport,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDraftReportResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            let report = resp.payload.report;

            let reports = this.reportsQuery.getValue().reports;
            let newReports = [report, ...reports];
            this.reportsQuery.update({ reports: newReports });

            this.navigateService.navigateToMetricsRep({
              reportId: report.reportId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  editDraftReport(item: {
    changeType: common.ChangeTypeEnum;
    rowChange: common.RowChange;
    rowIds: string[];
    reportId: string;
    fields: common.ReportField[];
    chart: common.MconfigChart;
  }) {
    let { rowChange, rowIds, reportId, changeType, fields, chart } = item;

    let uiState = this.uiQuery.getValue();

    let payload: apiToBackend.ToBackendEditDraftReportRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
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
      chart: chart
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendEditDraftReport,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendEditDraftReportResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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

    let payload: apiToBackend.ToBackendDeleteDraftReportsRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      reportIds: reportIds
    };

    this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendDeleteDraftReports,
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendDeleteDraftReportsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
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
              this.navigateService.navigateToMetricsRep({
                reportId: common.EMPTY_REPORT_ID
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }
}

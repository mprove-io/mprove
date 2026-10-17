import { Injectable } from '@angular/core';
import { take, tap } from 'rxjs/operators';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ReportX } from '#common/types/backend/parts/report/report-x';
import type { ToBackendCreateDraftReportOutput } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-output';
import type { ToBackendCreateDraftReportRequest } from '#common/types/backend/routes/reports/create-draft-report/create-draft-report-request';
import type { ToBackendDeleteDraftReportsOutput } from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-output';
import type { ToBackendDeleteDraftReportsRequest } from '#common/types/backend/routes/reports/delete-draft-reports/delete-draft-reports-request';
import type { ToBackendEditDraftReportOutput } from '#common/types/backend/routes/reports/edit-draft-report/edit-draft-report-output';
import type { ToBackendEditDraftReportRequest } from '#common/types/backend/routes/reports/edit-draft-report/edit-draft-report-request';
import type { MconfigChart } from '#common/types/blockml/parts/mconfig/mconfig-chart';
import type { ReportField } from '#common/types/blockml/parts/report/report-field';
import type { ChangeType } from '#common/types/blockml/parts/report/row/change-type';
import type { Listener } from '#common/types/blockml/parts/report/row/listener';
import type { RowChange } from '#common/types/blockml/parts/report/row/row-change';
import { MemberQuery } from '../queries/member.query';
import { NavQuery, NavState } from '../queries/nav.query';
import { ReportQuery } from '../queries/report.query';
import { ReportsQuery } from '../queries/reports.query';
import { StructQuery } from '../queries/struct.query';
import { UiQuery } from '../queries/ui.query';
import { ApiService } from './api.service';
import { NavigateService } from './navigate.service';
import { SpinnerService } from './spinner.service';

@Injectable({ providedIn: 'root' })
export class ReportService {
  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
    })
  );

  constructor(
    private spinnerService: SpinnerService,
    private apiService: ApiService,
    private uiQuery: UiQuery,
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
    changeType: ChangeType;
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
    changeType: ChangeType;
    rowChange: RowChange;
    rowIds: string[];
    fromReportId: string;
    fields: ReportField[];
    listeners: Listener[];
    chart: MconfigChart;
  }) {
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

    let payload: ToBackendCreateDraftReportRequest['input'] = {
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
        route: 'api/ToBackendCreateDraftReport',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendCreateDraftReportOutput = resp.output;

          let report = output.report;

          this.reportsQuery.update({
            reportUnitDrafts: output.reportUnitDrafts,
            reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
          });

          this.navigateService.navigateToReport({
            reportId: report.reportId
          });
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  editDraftReport(item: {
    changeType: ChangeType;
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

    let payload: ToBackendEditDraftReportRequest['input'] = {
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
        route: 'api/ToBackendEditDraftReport',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendEditDraftReportOutput = resp.output;

          this.memberQuery.update(output.userMember);

          this.structQuery.update(output.struct);
          this.navQuery.updatePart({
            needValidate: output.needValidate
          });

          this.reportQuery.update(output.report);

          return true;
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }

  deleteDraftReports(item: { reportIds: string[] }) {
    let { reportIds } = item;

    let report = this.reportQuery.getValue();

    let payload: ToBackendDeleteDraftReportsRequest['input'] = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      reportIds: reportIds
    };

    this.apiService
      .req({
        route: 'api/ToBackendDeleteDraftReports',
        payload: payload
      })
      .pipe(
        tap(resp => {
          if (resp.type !== 'Success') {
            return;
          }

          let output: ToBackendDeleteDraftReportsOutput = resp.output;

          this.reportsQuery.update({
            reportUnitDrafts: output.reportUnitDrafts,
            reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
          });

          if (reportIds.indexOf(report.reportId) > -1) {
            this.reportQuery.reset();
            this.navigateService.navigateToReports();
          }
        }),
        take(1),
        this.spinnerService.appTrack()
      )
      .subscribe();
  }
}

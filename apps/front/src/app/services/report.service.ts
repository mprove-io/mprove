import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ChangeTypeEnum } from '#common/enums/change-type.enum';
import { isDefined } from '#common/functions/is-defined/is-defined';
import type { ReportX } from '#common/zod/backend/report-x';
import type { ToBackendCreateDraftReportRequest } from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-request';
import type { ToBackendCreateDraftReportResponse } from '#common/zod/backend/routes/reports/create-draft-report/create-draft-report-response';
import type { ToBackendDeleteDraftReportsRequest } from '#common/zod/backend/routes/reports/delete-draft-reports/delete-draft-reports-request';
import type { ToBackendDeleteDraftReportsResponse } from '#common/zod/backend/routes/reports/delete-draft-reports/delete-draft-reports-response';
import type { ToBackendEditDraftReportRequest } from '#common/zod/backend/routes/reports/edit-draft-report/edit-draft-report-request';
import type { ToBackendEditDraftReportResponse } from '#common/zod/backend/routes/reports/edit-draft-report/edit-draft-report-response';
import type { Listener } from '#common/zod/blockml/listener';
import type { MconfigChart } from '#common/zod/blockml/mconfig-chart';
import type { ReportField } from '#common/zod/blockml/report-field';
import type { RowChange } from '#common/zod/blockml/row-change';
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
        tap((resp: ToBackendCreateDraftReportResponse) => {
          if (resp?.type === 'Success') {
            let report = resp.output.report;

            this.reportsQuery.update({
              reportUnitDrafts: resp.output.reportUnitDrafts,
              reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
            });

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
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendEditDraftReportResponse) => {
          if (resp?.type === 'Success') {
            this.memberQuery.update(resp.output.userMember);

            this.structQuery.update(resp.output.struct);
            this.navQuery.updatePart({
              needValidate: resp.output.needValidate
            });

            this.reportQuery.update(resp.output.report);

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
        payload: payload,
        showSpinner: true
      })
      .pipe(
        tap((resp: ToBackendDeleteDraftReportsResponse) => {
          if (resp?.type === 'Success') {
            this.reportsQuery.update({
              reportUnitDrafts: resp.output.reportUnitDrafts,
              reportSpaceNodes: this.reportsQuery.getValue().reportSpaceNodes
            });

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

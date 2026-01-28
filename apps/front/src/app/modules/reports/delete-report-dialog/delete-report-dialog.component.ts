import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import { Router } from '@angular/router';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { ReportX } from '#common/interfaces/backend/report-x';
import {
  ToBackendDeleteReportRequestPayload,
  ToBackendDeleteReportResponse
} from '#common/interfaces/to-backend/reports/to-backend-delete-report';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportsQuery } from '~front/app/queries/reports.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

export interface DeleteReportDialogData {
  apiService: ApiService;
  report: ReportX;
  projectId: string;
  branchId: string;
  envId: string;
  isRepoProd: boolean;
  isStartSpinnerUntilNavEnd: boolean;
}

@Component({
  selector: 'm-delete-report-dialog',
  templateUrl: './delete-report-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule]
})
export class DeleteReportDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  constructor(
    public ref: DialogRef<DeleteReportDialogData>,
    private spinner: NgxSpinnerService,
    private reportsQuery: ReportsQuery,
    private reportQuery: ReportQuery,
    private navigateService: NavigateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  delete() {
    if (this.ref.data.isStartSpinnerUntilNavEnd === true) {
      this.spinner.show(APP_SPINNER_NAME);
    }

    this.ref.close();

    let { projectId, branchId, isRepoProd } = this.ref.data;

    let report: ReportX = this.ref.data.report;
    let apiService: ApiService = this.ref.data.apiService;

    let payload: ToBackendDeleteReportRequestPayload = {
      projectId: projectId,
      branchId: branchId,
      envId: this.ref.data.envId,
      isRepoProd: isRepoProd,
      reportId: report.reportId
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendDeleteReport,
        payload: payload,
        showSpinner: !this.ref.data.isStartSpinnerUntilNavEnd
      })
      .pipe(
        tap((resp: ToBackendDeleteReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let reports = this.reportsQuery.getValue().reports;

            this.reportsQuery.update({
              reports: reports.filter(d => d.reportId !== report.reportId)
            });

            let currentReport = this.reportQuery.getValue();

            if (currentReport.reportId === report.reportId) {
              this.navigateService.navigateToReports();
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}

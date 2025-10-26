import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { MPROVE_USERS_FOLDER } from '~common/constants/top';
import { APP_SPINNER_NAME } from '~common/constants/top-front';
import { ResponseInfoStatusEnum } from '~common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '~common/functions/is-defined';
import { isDefinedAndNotEmpty } from '~common/functions/is-defined-and-not-empty';
import { isUndefined } from '~common/functions/is-undefined';
import { ReportX } from '~common/interfaces/backend/report-x';
import {
  ToBackendSaveCreateReportRequestPayload,
  ToBackendSaveCreateReportResponse
} from '~common/interfaces/to-backend/reports/to-backend-save-create-report';
import {
  ToBackendSaveModifyReportRequestPayload,
  ToBackendSaveModifyReportResponse
} from '~common/interfaces/to-backend/reports/to-backend-save-modify-report';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportsQuery } from '~front/app/queries/reports.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

enum ReportSaveAsEnum {
  NEW_REPORT = 'NEW_REPORT',
  REPLACE_EXISTING_REPORT = 'REPLACE_EXISTING_REPORT'
}

export interface ReportSaveAsDialogData {
  apiService: ApiService;
  reports: ReportX[];
  report: ReportX;
}

@Component({
  standalone: false,
  selector: 'm-report-save-as-dialog',
  templateUrl: './report-save-as-dialog.component.html'
})
export class ReportSaveAsDialogComponent implements OnInit {
  @ViewChild('reportSaveAsDialogExistingReportSelect', { static: false })
  reportSaveAsDialogExistingReportSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.reportSaveAsDialogExistingReportSelectElement?.close();
  }

  usersFolder = MPROVE_USERS_FOLDER;

  reportSaveAsEnum = ReportSaveAsEnum;

  spinnerName = 'reportSaveAs';

  report: ReportX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  saveAs: ReportSaveAsEnum = ReportSaveAsEnum.NEW_REPORT;

  newReportId: string;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  fromReportId: string;

  selectedReportId: any; // string
  selectedRepPath: string;

  reports: ReportX[];

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<ReportSaveAsDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private reportQuery: ReportQuery,
    private reportsQuery: ReportsQuery,
    private uiQuery: UiQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.report = this.ref.data.report;

    this.fromReportId = this.ref.data.report.reportId;
    this.newReportId = this.ref.data.report.reportId;

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.report.title
    });

    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.report.accessRoles?.join(', ')
    });

    this.reports = this.ref.data.reports.map(x => {
      (x as any).disabled = !x.canEditOrDeleteReport;
      return x;
    });

    this.makePath();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (
      this.titleForm.controls['title'].valid &&
      this.rolesForm.controls['roles'].valid
    ) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = this.rolesForm.controls['roles'].value;

      if (this.saveAs === ReportSaveAsEnum.NEW_REPORT) {
        this.saveAsNewRep({
          newTitle: newTitle,
          roles: roles
        });
      } else if (this.saveAs === ReportSaveAsEnum.REPLACE_EXISTING_REPORT) {
        this.saveAsExistingRep({
          newTitle: newTitle,
          roles: roles
        });
      }
    }
  }

  newRepOnClick() {
    this.saveAs = ReportSaveAsEnum.NEW_REPORT;
  }

  existingRepOnClick() {
    this.saveAs = ReportSaveAsEnum.REPLACE_EXISTING_REPORT;
  }

  saveAsNewRep(item: { newTitle: string; roles: string }) {
    let { newTitle, roles } = item;

    let uiState = this.uiQuery.getValue();

    let payload: ToBackendSaveCreateReportRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      newReportId: this.newReportId,
      fromReportId: this.fromReportId,
      title: newTitle,
      accessRoles: isDefinedAndNotEmpty(roles?.trim()) ? roles.split(',') : [],
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick,
      newReportFields: this.report.fields,
      chart: this.report.chart
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(APP_SPINNER_NAME);

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveCreateReport,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveCreateReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let newReport = resp.payload.report;
            let newReportPart = resp.payload.reportPart;

            if (isDefined(newReport)) {
              let reports = this.reportsQuery.getValue().reports;

              let newReports = [
                newReportPart,
                ...reports.filter(
                  x =>
                    x.reportId !== newReportPart.reportId &&
                    (x.draft === false || x.reportId !== this.fromReportId)
                )
              ];

              this.reportsQuery.update({ reports: newReports });

              let currentReport = this.reportQuery.getValue();

              if (currentReport.reportId === newReport.reportId) {
                this.reportQuery.update(newReport);
              }

              this.spinner.hide(APP_SPINNER_NAME); // route params do not change

              this.navigateService.navigateToReport({
                reportId: resp.payload.report.reportId
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  saveAsExistingRep(item: { newTitle: string; roles: string }) {
    let { newTitle, roles } = item;

    let uiState = this.uiQuery.getValue();

    this.spinner.show(APP_SPINNER_NAME);

    let payload: ToBackendSaveModifyReportRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      modReportId: this.selectedReportId,
      fromReportId: this.fromReportId,
      title: newTitle,
      accessRoles: isDefinedAndNotEmpty(roles?.trim())
        ? roles.split(',').map(x => x.trim())
        : [],
      timezone: uiState.timezone,
      timeSpec: uiState.timeSpec,
      timeRangeFractionBrick: uiState.timeRangeFraction.brick,
      newReportFields: this.report.fields,
      chart: this.report.chart
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveModifyReportResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let newReport = resp.payload.report;
            let newReportPart = resp.payload.reportPart;

            if (isDefined(newReport)) {
              let reports = this.reportsQuery.getValue().reports;

              let newReports = [
                newReportPart,
                ...reports.filter(
                  x =>
                    x.reportId !== newReportPart.reportId &&
                    (x.draft === false || x.reportId !== this.fromReportId)
                )
              ];

              this.reportsQuery.update({ reports: newReports });

              let currentReport = this.reportQuery.getValue();

              if (currentReport.reportId === newReport.reportId) {
                this.reportQuery.update(newReport);
              }

              this.navigateService.navigateToReport({
                reportId: resp.payload.report.reportId
              });
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  selectedChange() {
    this.makePath();
    if (isDefined(this.selectedReportId)) {
      let selectedReport = this.reports.find(
        x => x.reportId === this.selectedReportId
      );
      this.titleForm.controls['title'].setValue(selectedReport.title);
    }
  }

  makePath() {
    if (isUndefined(this.selectedReportId) || isUndefined(this.reports)) {
      return;
    }

    let selectedReport = this.reports.find(
      x => x.reportId === this.selectedReportId
    );

    if (isDefined(selectedReport)) {
      let parts = selectedReport.filePath.split('/');

      parts.shift();

      this.selectedRepPath = parts.join(' / ');
    }
  }

  cancel() {
    this.ref.close();
  }
}

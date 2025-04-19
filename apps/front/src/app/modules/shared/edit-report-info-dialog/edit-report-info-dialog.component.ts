import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  OnInit
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { ReportQuery } from '~front/app/queries/report.query';
import { ReportsQuery } from '~front/app/queries/reports.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../shared.module';

export interface EditReportInfoDialogData {
  apiService: ApiService;
  projectId: string;
  isRepoProd: boolean;
  branchId: string;
  envId: string;
  report: common.Report;
}

@Component({
  selector: 'm-edit-report-info-dialog',
  templateUrl: './edit-report-info-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class EditReportInfoDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  usersFolder = common.MPROVE_USERS_FOLDER;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
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
    public ref: DialogRef<EditReportInfoDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private reportsQuery: ReportsQuery,
    private reportQuery: ReportQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.report.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.ref.data.report.accessRoles?.join(', ')
    });

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  save() {
    if (
      this.titleForm.controls['title'].valid &&
      this.rolesForm.controls['roles'].valid
    ) {
      this.spinner.show(constants.APP_SPINNER_NAME);

      this.ref.close();

      let uiState = this.uiQuery.getValue();

      let newTitle: string = this.titleForm.controls['title'].value;
      let roles: string = this.rolesForm.controls['roles'].value;

      let payload: apiToBackend.ToBackendSaveModifyReportRequestPayload = {
        projectId: this.ref.data.projectId,
        isRepoProd: this.ref.data.isRepoProd,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        fromReportId: this.ref.data.report.reportId,
        modReportId: this.ref.data.report.reportId,
        title: newTitle.trim(),
        accessRoles: common.isDefinedAndNotEmpty(roles?.trim())
          ? roles.split(',').map(x => x.trim())
          : [],
        timezone: uiState.timezone,
        timeSpec: uiState.timeSpec,
        timeRangeFractionBrick: uiState.timeRangeFraction.brick,
        newReportFields: this.ref.data.report.fields,
        chart: this.ref.data.report.chart
      };

      let apiService: ApiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName:
            apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSaveModifyReport,
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap(async (resp: apiToBackend.ToBackendSaveModifyReportResponse) => {
            if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
              let newReport = resp.payload.report;
              let newReportPart = resp.payload.reportPart;

              if (common.isDefined(newReport)) {
                let reports = this.reportsQuery.getValue().reports;

                let newReports = [
                  newReportPart,
                  ...reports.filter(x => x.reportId !== newReportPart.reportId)
                ];

                this.reportsQuery.update({ reports: newReports });

                let currentReport = this.reportQuery.getValue();

                if (currentReport.reportId === newReport.reportId) {
                  this.reportQuery.update(newReport);
                }
              }
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  cancel() {
    this.ref.close();
  }
}

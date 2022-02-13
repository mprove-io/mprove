import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { NavQuery } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { NavState } from '~front/app/stores/nav.store';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';

enum ChartSaveAsEnum {
  NEW_VIZ = 'NEW_VIZ',
  REPORT_OF_DASHBOARD = 'REPORT_OF_DASHBOARD'
}

enum ReportSaveAsEnum {
  NEW_REPORT = 'NEW_REPORT',
  REPLACE_EXISTING_REPORT = 'REPLACE_EXISTING_REPORT'
}

@Component({
  selector: 'm-chart-save-as-dialog',
  templateUrl: './chart-save-as-dialog.component.html'
})
export class ChartSaveAsDialogComponent implements OnInit {
  chartSaveAsEnum = ChartSaveAsEnum;
  reportSaveAsEnum = ReportSaveAsEnum;

  spinnerName = 'chartSaveAs';

  titleForm: FormGroup = this.fb.group(
    {
      title: [undefined, [Validators.required, Validators.maxLength(255)]]
    },
    {
      validator: this.titleValidator.bind(this)
    }
  );

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  usersForm: FormGroup = this.fb.group({
    users: [undefined, [Validators.maxLength(255)]]
  });

  chartSaveAs: ChartSaveAsEnum = ChartSaveAsEnum.NEW_VIZ;
  reportSaveAs: ReportSaveAsEnum = ReportSaveAsEnum.NEW_REPORT;

  vizId = common.makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  selectedDashboardId: string;
  selectedDashboardPath: string;
  selectedDashboard: common.DashboardX;

  selectedReportTitle: string;

  dashboards: common.DashboardX[];

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.mconfig.chart.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.ref.data.model.accessRoles?.join(', ')
    });
    setValueAndMark({
      control: this.usersForm.controls['users'],
      value: this.ref.data.model.accessUsers?.join(', ')
    });

    let nav: NavState;
    this.navQuery
      .select()
      .pipe(
        tap(x => {
          nav = x;
        }),
        take(1)
      )
      .subscribe();

    let payload: apiToBackend.ToBackendGetDashboardsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.spinnerName);

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendGetDashboardsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.dashboards = resp.payload.dashboards.map(z => {
              (z as any).disabled = !z.canEditOrDeleteDashboard;
              return z;
            });

            this.makePath();

            this.spinner.hide(this.spinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();
  }

  titleValidator(group: AbstractControl): ValidationErrors | null {
    if (common.isUndefined(this.titleForm)) {
      return null;
    }

    let title: string = this.titleForm.controls['title'].value.toUpperCase();

    if (
      this.chartSaveAs === this.chartSaveAsEnum.REPORT_OF_DASHBOARD &&
      common.isDefined(this.selectedDashboard)
    ) {
      let titles = this.selectedDashboard.reports.map(x =>
        x.title.toUpperCase()
      );

      if (
        this.reportSaveAs === this.reportSaveAsEnum.NEW_REPORT &&
        titles.indexOf(title) > -1
      ) {
        this.titleForm.controls['title'].setErrors({ titleIsNotUnique: true });
      } else if (
        this.reportSaveAs === this.reportSaveAsEnum.REPLACE_EXISTING_REPORT &&
        titles.indexOf(title) > -1 &&
        title !== this.selectedReportTitle?.toUpperCase()
      ) {
        this.titleForm.controls['title'].setErrors({ titleIsNotUnique: true });
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  save() {
    if (this.titleForm.controls['title'].valid) {
      let newTitle = this.titleForm.controls['title'].value;

      if (
        this.chartSaveAs === ChartSaveAsEnum.NEW_VIZ &&
        this.rolesForm.controls['roles'].valid &&
        this.usersForm.controls['users'].valid
      ) {
        this.ref.close();
        let roles = this.rolesForm.controls['roles'].value;
        let users = this.usersForm.controls['users'].value;

        this.saveAsNewViz({
          newTitle: newTitle,
          roles: roles,
          users: users
        });
      } else if (this.chartSaveAs === ChartSaveAsEnum.REPORT_OF_DASHBOARD) {
        this.ref.close();
        this.saveAsReport({ newTitle: newTitle });
      }
    }
  }

  newVizOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.NEW_VIZ;
    this.titleForm.get('title').updateValueAndValidity();
  }

  reportOfDashboardOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.REPORT_OF_DASHBOARD;
    this.titleForm.get('title').updateValueAndValidity();
  }

  newReportOnClick() {
    this.reportSaveAs = ReportSaveAsEnum.NEW_REPORT;
    this.titleForm.get('title').updateValueAndValidity();
  }

  replaceExistingReportOnClick() {
    this.reportSaveAs = ReportSaveAsEnum.REPLACE_EXISTING_REPORT;
    this.titleForm.get('title').updateValueAndValidity();
  }

  selectedDashboardChange() {
    this.selectedReportTitle = undefined;
    this.setSelectedDashboard();
    this.makePath();
    this.titleForm.get('title').updateValueAndValidity();
  }

  selectedReportChange() {
    this.titleForm.get('title').updateValueAndValidity();
  }

  setSelectedDashboard() {
    if (
      common.isUndefined(this.selectedDashboardId) ||
      common.isUndefined(this.dashboards)
    ) {
      return;
    }

    this.selectedDashboard = this.dashboards.find(
      x => x.dashboardId === this.selectedDashboardId
    );
  }

  makePath() {
    if (
      common.isUndefined(this.selectedDashboardId) ||
      common.isUndefined(this.dashboards)
    ) {
      return;
    }

    let selectedDashboard = this.dashboards.find(
      x => x.dashboardId === this.selectedDashboardId
    );

    if (common.isDefined(selectedDashboard)) {
      let parts = selectedDashboard.filePath.split('/');

      parts.shift();

      this.selectedDashboardPath = parts.join(' / ');
    }
  }

  saveAsNewViz(item: { newTitle: string; roles: string; users: string }) {
    let { newTitle, roles, users } = item;

    let payload: apiToBackend.ToBackendCreateVizRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      vizId: this.vizId,
      reportTitle: newTitle.trim(),
      accessRoles: roles,
      accessUsers: users,
      mconfig: this.ref.data.mconfig
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateVizResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.navigateService.navigateToVizs({
              extra: {
                queryParams: { search: resp.payload.viz.vizId }
              }
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  async saveAsReport(item: { newTitle: string }) {
    let { newTitle } = item;

    let apiService: ApiService = this.ref.data.apiService;

    let newReport: common.ReportX = {
      mconfig: this.ref.data.mconfig,
      modelId: this.ref.data.mconfig.modelId,
      modelLabel: this.ref.data.model.label,
      mconfigId: this.ref.data.mconfig.mconfigId,
      timezone: this.ref.data.mconfig.timezone,
      listen: {},
      queryId: this.ref.data.mconfig.queryId,
      hasAccessToModel: this.ref.data.model.hasAccess,
      title: newTitle.trim(),
      tileWidth: common.REPORT_DEFAULT_TILE_WIDTH,
      tileHeight: common.REPORT_DEFAULT_TILE_HEIGHT,
      tileX: common.REPORT_DEFAULT_TILE_X,
      tileY: common.REPORT_DEFAULT_TILE_Y // recalculated on backend
    };

    let payloadModifyDashboard: apiToBackend.ToBackendModifyDashboardRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      toDashboardId: this.selectedDashboardId,
      fromDashboardId: this.selectedDashboardId,
      selectedReportTitle: this.selectedReportTitle,
      newReport: newReport,
      isReplaceReport:
        this.reportSaveAs === ReportSaveAsEnum.REPLACE_EXISTING_REPORT
    };

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard,
        payloadModifyDashboard
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendModifyDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.navigateService.navigateToDashboard(this.selectedDashboardId);
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

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
import { map, take, tap } from 'rxjs/operators';
import { makeDashboardFileText } from '~front/app/functions/make-dashboard-file-text';
import { prepareReport } from '~front/app/functions/prepare-report';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { toYaml } from '~front/app/functions/to-yaml';
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

  groupForm: FormGroup = this.fb.group({
    group: [undefined, [Validators.maxLength(255)]]
  });

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
          this.dashboards = resp.payload.dashboards.filter(
            z => z.canEditOrDeleteDashboard === true
          );

          this.makePath();

          this.spinner.hide(this.spinnerName);

          this.cd.detectChanges();
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
        this.groupForm.controls['group'].valid &&
        this.rolesForm.controls['roles'].valid &&
        this.usersForm.controls['users'].valid
      ) {
        this.ref.close();
        let group = this.groupForm.controls['group'].value;
        let roles = this.rolesForm.controls['roles'].value;
        let users = this.usersForm.controls['users'].value;

        this.saveAsNewViz({
          newTitle: newTitle,
          group: group,
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

  saveAsNewViz(item: {
    newTitle: string;
    group: string;
    roles: string;
    users: string;
  }) {
    let { newTitle, group, roles, users } = item;

    let rep = prepareReport({
      isForDashboard: false,
      mconfig: this.ref.data.mconfig
    });

    rep.title = newTitle.trim();

    let vizFileText = toYaml({
      viz: this.vizId,
      group:
        common.isDefined(group) && group.trim().length > 0
          ? group.trim()
          : undefined,
      access_roles:
        common.isDefined(roles) && roles.trim().length > 0
          ? roles.split(',').map(x => x.trim())
          : undefined,
      access_users:
        common.isDefined(users) && users.trim().length > 0
          ? users.split(',').map(x => x.trim())
          : undefined,
      reports: [rep]
    });

    let payload: apiToBackend.ToBackendCreateVizRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      vizId: this.vizId,
      vizFileText: vizFileText
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateVizResponse) => {
          this.navigateService.navigateToVizs({
            extra: {
              queryParams: { search: resp.payload.viz.vizId }
            }
          });
        }),
        take(1)
      )
      .subscribe();
  }

  async saveAsReport(item: { newTitle: string }) {
    let { newTitle } = item;

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

    let payloadGetDashboard: apiToBackend.ToBackendGetDashboardRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      isRepoProd: nav.isRepoProd,
      dashboardId: this.selectedDashboardId
    };

    let apiService: ApiService = this.ref.data.apiService;

    let dashboard: common.DashboardX = await apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        payloadGetDashboard
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetDashboardResponse) =>
            resp.payload.dashboard
        )
      )
      .toPromise();

    let tileY = 0;

    dashboard.reports.forEach(report => {
      tileY = tileY + report.tileHeight;
    });

    let newReport: common.ReportX = {
      mconfig: this.ref.data.mconfig,
      query: this.ref.data.query,
      modelId: this.ref.data.mconfig.modelId,
      modelLabel: this.ref.data.model.label,
      mconfigId: this.ref.data.mconfig.mconfigId,
      listen: undefined,
      queryId: this.ref.data.mconfig.queryId,
      hasAccessToModel: this.ref.data.model.hasAccess,
      title: newTitle.trim(),
      tileWidth: common.CHART_DEFAULT_TILE_WIDTH,
      tileHeight: common.CHART_DEFAULT_TILE_HEIGHT,
      tileX: common.CHART_DEFAULT_TILE_X,
      tileY: tileY
    };

    newReport.mconfig.chart.title = newReport.title;

    if (this.reportSaveAs === ReportSaveAsEnum.REPLACE_EXISTING_REPORT) {
      let oldReportIndex = dashboard.reports.findIndex(
        x => x.title === this.selectedReportTitle
      );

      let oldReport = dashboard.reports[oldReportIndex];

      newReport.tileWidth = oldReport.tileWidth;
      newReport.tileHeight = oldReport.tileHeight;
      newReport.tileX = oldReport.tileX;
      newReport.tileY = oldReport.tileY;

      dashboard.reports[oldReportIndex] = newReport;
    } else {
      dashboard.reports = [...dashboard.reports, newReport];
    }

    let dashboardFileText = makeDashboardFileText({
      dashboard: dashboard,
      newDashboardId: this.selectedDashboardId,
      newTitle: dashboard.title,
      group: dashboard.gr,
      roles: dashboard.accessRoles.join(', '),
      users: dashboard.accessUsers.join(', ')
    });

    let payloadModifyDashboard: apiToBackend.ToBackendModifyDashboardRequestPayload = {
      projectId: this.ref.data.projectId,
      isRepoProd: this.ref.data.isRepoProd,
      branchId: this.ref.data.branchId,
      dashboardId: this.selectedDashboardId,
      dashboardFileText: dashboardFileText
    };

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard,
        payloadModifyDashboard
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendModifyDashboardResponse) => {
          this.navigateService.navigateToDashboard(this.selectedDashboardId);
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }
}

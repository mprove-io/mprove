import { CommonModule } from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';
import { SharedModule } from '../../shared/shared.module';

enum ChartSaveAsEnum {
  NEW_VIZ = 'NEW_VIZ',
  REPORT_OF_DASHBOARD = 'REPORT_OF_DASHBOARD'
}

enum ReportSaveAsEnum {
  NEW_REPORT = 'NEW_REPORT',
  REPLACE_EXISTING_REPORT = 'REPLACE_EXISTING_REPORT'
}

export interface ChartSaveAsDialogData {
  apiService: ApiService;
  mconfig: common.MconfigX;
  query: common.Query;
  model: common.Model;
}

@Component({
  selector: 'm-chart-save-as-dialog',
  templateUrl: './chart-save-as-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, SharedModule]
})
export class ChartSaveAsDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  usersFolder = common.MPROVE_USERS_FOLDER;

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

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<ChartSaveAsDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
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
      envId: nav.envId,
      isRepoProd: nav.isRepoProd
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.spinnerName);

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetDashboardsResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.dashboards = resp.payload.dashboards.map(x => {
              (x as any).disabled = !x.canEditOrDeleteDashboard;
              return x;
            });

            this.makePath();

            this.spinner.hide(this.spinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
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
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { newTitle, roles, users } = item;

    let payload: apiToBackend.ToBackendCreateVizRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      vizId: this.vizId,
      reportTitle: newTitle.trim(),
      accessRoles: roles,
      accessUsers: users,
      mconfig: this.ref.data.mconfig
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateViz,
        payload: payload
      })
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
    this.spinner.show(constants.APP_SPINNER_NAME);

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
      hasAccessToModel: true,
      title: newTitle.trim(),
      tileWidth: common.REPORT_DEFAULT_TILE_WIDTH,
      tileHeight: common.REPORT_DEFAULT_TILE_HEIGHT,
      tileX: common.REPORT_DEFAULT_TILE_X,
      tileY: common.REPORT_DEFAULT_TILE_Y // recalculated on backend
    };

    let payloadModifyDashboard: apiToBackend.ToBackendModifyDashboardRequestPayload =
      {
        projectId: this.nav.projectId,
        isRepoProd: this.nav.isRepoProd,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        toDashboardId: this.selectedDashboardId,
        fromDashboardId: this.selectedDashboardId,
        selectedReportTitle: this.selectedReportTitle,
        newReport: newReport,
        isReplaceReport:
          this.reportSaveAs === ReportSaveAsEnum.REPLACE_EXISTING_REPORT
      };

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard,
        payload: payloadModifyDashboard
      })
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

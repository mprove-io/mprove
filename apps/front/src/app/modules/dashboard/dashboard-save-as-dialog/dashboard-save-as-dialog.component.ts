import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

enum DashboardSaveAsEnum {
  NEW_DASHBOARD = 'NEW_DASHBOARD',
  REPLACE_EXISTING_DASHBOARD = 'REPLACE_EXISTING_DASHBOARD'
}

@Component({
  selector: 'm-dashboard-save-as-dialog',
  templateUrl: './dashboard-save-as-dialog.component.html'
})
export class DashboardSaveAsDialogComponent implements OnInit {
  dashboardSaveAsEnum = DashboardSaveAsEnum;

  spinnerName = 'dashboardSaveAs';

  dashboard: common.DashboardX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  usersForm: FormGroup = this.fb.group({
    users: [undefined, [Validators.maxLength(255)]]
  });

  saveAs: DashboardSaveAsEnum = DashboardSaveAsEnum.NEW_DASHBOARD;

  newDashboardId = common.makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  selectedDashboardId: string;
  selectedDashboardPath: string;

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
    private navQuery: NavQuery,
    private navigateService: NavigateService,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard as common.DashboardX;

    this.selectedDashboardId =
      this.dashboard.temp === false ? this.dashboard.dashboardId : undefined;

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.dashboard.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.dashboard.accessRoles?.join(', ')
    });
    setValueAndMark({
      control: this.usersForm.controls['users'],
      value: this.dashboard.accessUsers?.join(', ')
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

  save() {
    if (
      this.titleForm.controls['title'].valid &&
      this.rolesForm.controls['roles'].valid &&
      this.usersForm.controls['users'].valid
    ) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = this.rolesForm.controls['roles'].value;
      let users = this.usersForm.controls['users'].value;

      if (this.saveAs === DashboardSaveAsEnum.NEW_DASHBOARD) {
        this.saveAsNewDashboard({
          newTitle: newTitle,
          roles: roles,
          users: users
        });
      } else if (
        this.saveAs === DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD
      ) {
        this.saveAsExistingDashboard({
          newTitle: newTitle,
          roles: roles,
          users: users
        });
      }
    }
  }

  newDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.NEW_DASHBOARD;
  }

  existingDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD;
  }

  saveAsNewDashboard(item: { newTitle: string; roles: string; users: string }) {
    let { newTitle, roles, users } = item;

    let payload: apiToBackend.ToBackendCreateDashboardRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
      newDashboardId: this.newDashboardId,
      fromDashboardId: this.dashboard.dashboardId,
      accessRoles: roles,
      accessUsers: users,
      dashboardTitle: newTitle,
      reportsGrid: this.dashboard.reports.map(x => {
        let z = common.makeCopy(x);
        delete z.mconfig;
        delete z.query;
        return z;
      })
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDashboard,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDashboardResponse) => {
          this.navigateService.navigateToDashboards({
            extra: {
              queryParams: { search: this.newDashboardId }
            }
          });
        }),
        take(1)
      )
      .subscribe();
  }

  saveAsExistingDashboard(item: {
    newTitle: string;
    roles: string;
    users: string;
  }) {
    let { newTitle, roles, users } = item;

    let payload: apiToBackend.ToBackendModifyDashboardRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
      toDashboardId: this.selectedDashboardId,
      fromDashboardId: this.dashboard.dashboardId,
      accessRoles: roles,
      accessUsers: users,
      dashboardTitle: newTitle,
      reportsGrid: this.dashboard.reports.map(x => {
        let z = common.makeCopy(x);
        delete z.mconfig;
        delete z.query;
        return z;
      })
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard,
        payload
      )
      .pipe(
        tap((resp: apiToBackend.ToBackendModifyDashboardResponse) => {
          this.navigateService.navigateToDashboards({
            extra: {
              queryParams: { search: this.selectedDashboardId }
            }
          });
        }),
        take(1)
      )
      .subscribe();
  }

  selectedChange() {
    this.makePath();
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

  cancel() {
    this.ref.close();
  }
}

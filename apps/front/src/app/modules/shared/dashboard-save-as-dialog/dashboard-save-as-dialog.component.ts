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
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

enum DashboardSaveAsEnum {
  NEW_DASHBOARD = 'NEW_DASHBOARD',
  REPLACE_EXISTING_DASHBOARD = 'REPLACE_EXISTING_DASHBOARD'
}

export interface DashboardSaveAsDialogData {
  apiService: ApiService;
  dashboard: common.Dashboard;
}

@Component({
  selector: 'm-dashboard-save-as-dialog',
  templateUrl: './dashboard-save-as-dialog.component.html'
})
export class DashboardSaveAsDialogComponent implements OnInit {
  @ViewChild('dashboardSaveAsDialogExistingDashboardSelect', { static: false })
  dashboardSaveAsDialogExistingDashboardSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.dashboardSaveAsDialogExistingDashboardSelectElement?.close();
    // this.ref.close();
  }

  usersFolder = common.MPROVE_USERS_FOLDER;

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

  selectedDashboardId: any; // string
  selectedDashboardPath: string;

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
    public ref: DialogRef<DashboardSaveAsDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private dashboardsQuery: DashboardsQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard as common.DashboardX;

    this.selectedDashboardId =
      this.dashboard.draft === false &&
      this.dashboard.canEditOrDeleteDashboard === true
        ? this.dashboard.dashboardId
        : undefined;

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
      isRepoProd: nav.isRepoProd,
      envId: nav.envId
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
            this.dashboards = resp.payload.dashboards
              .filter(d => d.draft === false)
              .map(x => {
                (x as any).disabled = x.canEditOrDeleteDashboard === false;
                return x;
              });

            this.makePathAndSetTitle();

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

  save() {
    this.titleForm.markAllAsTouched();
    this.rolesForm.markAllAsTouched();
    this.usersForm.markAllAsTouched();

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

    this.titleForm.controls['title'].setValue(undefined);
  }

  existingDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD;

    this.makePathAndSetTitle();
  }

  saveAsNewDashboard(item: { newTitle: string; roles: string; users: string }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { newTitle, roles, users } = item;

    let payload: apiToBackend.ToBackendCreateDashboardRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      newDashboardId: this.newDashboardId,
      fromDashboardId: this.dashboard.dashboardId,
      accessRoles: roles,
      accessUsers: users,
      dashboardTitle: newTitle,
      tilesGrid: this.dashboard.tiles.map(x => {
        let y = common.makeCopy(x);
        delete y.mconfig;
        delete y.query;
        return y;
      })
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            // let dashboardPart = resp.payload.newDashboardPart;

            // let dashboards = this.dashboardsQuery.getValue().dashboards;
            // let newDashboards = [dashboardPart, ...dashboards];

            // this.dashboardsQuery.update({ dashboards: newDashboards });

            this.navigateService.navigateToDashboard(this.newDashboardId);
          }
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
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { newTitle, roles, users } = item;

    let payload: apiToBackend.ToBackendModifyDashboardRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      toDashboardId: this.selectedDashboardId,
      fromDashboardId: this.dashboard.dashboardId,
      accessRoles: roles,
      accessUsers: users,
      dashboardTitle: newTitle,
      tilesGrid: this.dashboard.tiles.map(x => {
        let y = common.makeCopy(x);
        delete y.mconfig;
        delete y.query;
        return y;
      })
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendModifyDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendModifyDashboardResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            // let dashboards = this.dashboardsQuery.getValue().dashboards;

            // let newDashboards = [
            //   ...dashboards.filter(
            //     d =>
            //       d.draft === false ||
            //       d.dashboardId !== this.dashboard.dashboardId
            //   )
            // ];

            // this.dashboardsQuery.update({ dashboards: newDashboards });

            this.navigateService.navigateToDashboard(this.selectedDashboardId);
          }
        }),
        take(1)
      )
      .subscribe();
  }

  selectedChange() {
    this.makePathAndSetTitle();
  }

  makePathAndSetTitle() {
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

      this.titleForm.controls['title'].setValue(selectedDashboard.title);
    }
  }

  cancel() {
    this.ref.close();
  }
}

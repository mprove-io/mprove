import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import type { DashboardPart } from '#common/zod/backend/dashboard-part';
import type { DashboardX } from '#common/zod/backend/dashboard-x';
import type { Role } from '#common/zod/backend/role';
import type { Dashboard } from '#common/zod/blockml/dashboard';
import type {
  ToBackendGetDashboardsRequestPayload,
  ToBackendGetDashboardsResponse
} from '#common/zod/to-backend/dashboards/to-backend-get-dashboards';
import type {
  ToBackendSaveCreateDashboardRequestPayload,
  ToBackendSaveCreateDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-create-dashboard';
import type {
  ToBackendSaveModifyDashboardRequestPayload,
  ToBackendSaveModifyDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-modify-dashboard';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { DashboardPartsQuery } from '#front/app/queries/dashboard-parts.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';

enum DashboardSaveAsEnum {
  NEW_DASHBOARD = 'NEW_DASHBOARD',
  REPLACE_EXISTING_DASHBOARD = 'REPLACE_EXISTING_DASHBOARD'
}

export interface DashboardSaveAsDialogData {
  apiService: ApiService;
  dashboard: Dashboard;
}

@Component({
  standalone: false,
  selector: 'm-dashboard-save-as-dialog',
  templateUrl: './dashboard-save-as-dialog.component.html'
})
export class DashboardSaveAsDialogComponent implements OnInit {
  @ViewChild('dashboardSaveAsDialogExistingDashboardSelect', { static: false })
  dashboardSaveAsDialogExistingDashboardSelectElement: NgSelectComponent;

  @ViewChild('dashboardSaveAsDialogRoleSelect', { static: false })
  dashboardSaveAsDialogRoleSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.dashboardSaveAsDialogExistingDashboardSelectElement?.close();
    this.dashboardSaveAsDialogRoleSelectElement?.close();
  }

  usersFolder = MPROVE_USERS_FOLDER;

  dashboardSaveAsEnum = DashboardSaveAsEnum;

  spinnerName = 'dashboardSaveAs';

  dashboard: DashboardX;

  newDashboardId = makeId();

  saveAs: DashboardSaveAsEnum = DashboardSaveAsEnum.NEW_DASHBOARD;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  selectedDashboardId: any; // string
  selectedDashboardPath: string;

  dashboardParts: DashboardPart[];

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
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private dashboardPartsQuery: DashboardPartsQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard as DashboardX;

    this.selectedDashboardId =
      this.dashboard.draft === false &&
      this.dashboard.canEditOrDeleteDashboard === true
        ? this.dashboard.dashboardId
        : undefined;

    this.selectedAccessRoles = [...(this.dashboard.accessRoles || [])];

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

    this.nav = nav;

    this.loadRoles();

    let payload: ToBackendGetDashboardsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      repoId: nav.repoId,
      envId: nav.envId
    };

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.spinnerName);

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetDashboards,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetDashboardsResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.dashboardParts = resp.payload.dashboardParts
              .filter(d => d.draft === false)
              .map(x => {
                (x as any).disabled = x.canEditOrDeleteDashboard === false;
                return x;
              });

            this.makePathAndSetValues();

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

    if (this.titleForm.controls['title'].valid) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = [...this.selectedAccessRoles];

      if (this.saveAs === DashboardSaveAsEnum.NEW_DASHBOARD) {
        this.saveAsNewDashboard({
          newTitle: newTitle,
          roles: roles
        });
      } else if (
        this.saveAs === DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD
      ) {
        this.saveAsExistingDashboard({
          newTitle: newTitle,
          roles: roles
        });
      }
    }
  }

  newDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.NEW_DASHBOARD;

    this.titleForm.controls['title'].setValue(undefined);
    this.selectedDashboardId = undefined;
    this.selectedDashboardPath = '';
    this.selectedAccessRoles = [];
  }

  existingDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD;
    this.selectedDashboardId = undefined;
    this.selectedDashboardPath = '';
    this.titleForm.controls['title'].setValue(undefined);
    this.selectedAccessRoles = [];
  }

  existingDashboardSearchFn(term: string, dashboardPart: DashboardPart) {
    let trimmedTerm = term?.trim();

    if (!trimmedTerm) {
      return true;
    }

    let haystack = [
      `${isDefined(dashboardPart.title) ? dashboardPart.title : dashboardPart.dashboardId} ${dashboardPart.author ?? ''}`
    ];
    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, trimmedTerm);

    return idxs != null && idxs.length > 0;
  }

  saveAsNewDashboard(item: { newTitle: string; roles: string[] }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { newTitle, roles } = item;

    let payload: ToBackendSaveCreateDashboardRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      repoId: this.nav.repoId,
      newDashboardId: this.newDashboardId,
      fromDashboardId: this.dashboard.dashboardId,
      accessRoles: roles,
      dashboardTitle: newTitle,
      tilesGrid: this.dashboard.tiles.map(x => {
        let y = makeCopy(x);
        delete y.mconfig;
        delete y.query;
        return y;
      }),
      timezone: this.uiQuery.getValue().timezone
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveCreateDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveCreateDashboardResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let dashboardPart = resp.payload.newDashboardPart;
            if (isDefined(dashboardPart)) {
              let dashboardParts =
                this.dashboardPartsQuery.getValue().dashboardParts;

              let newDashboardParts = [
                dashboardPart,
                ...dashboardParts.filter(
                  d =>
                    d.dashboardId !== dashboardPart.dashboardId &&
                    !(
                      d.draft === true &&
                      d.dashboardId === this.dashboard.dashboardId
                    )
                )
              ];

              this.dashboardPartsQuery.update({
                dashboardParts: newDashboardParts
              });

              this.navigateService.navigateToDashboard({
                dashboardId: this.newDashboardId
              });
            } else {
              this.spinner.hide(this.spinnerName);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  saveAsExistingDashboard(item: { newTitle: string; roles: string[] }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { newTitle, roles } = item;

    let payload: ToBackendSaveModifyDashboardRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      repoId: this.nav.repoId,
      toDashboardId: this.selectedDashboardId,
      fromDashboardId: this.dashboard.dashboardId,
      accessRoles: roles,
      dashboardTitle: newTitle,
      tilesGrid: this.dashboard.tiles.map(x => {
        let y = makeCopy(x);
        delete y.mconfig;
        delete y.query;
        return y;
      }),
      timezone: this.uiQuery.getValue().timezone
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveModifyDashboardResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let dashboardPart = resp.payload.newDashboardPart;

            if (isDefined(dashboardPart)) {
              let dashboardParts =
                this.dashboardPartsQuery.getValue().dashboardParts;

              let newDashboardParts = [
                dashboardPart,
                ...dashboardParts.filter(
                  d =>
                    d.dashboardId !== dashboardPart.dashboardId &&
                    !(
                      d.draft === true &&
                      d.dashboardId === this.dashboard.dashboardId
                    )
                )
              ];

              this.dashboardPartsQuery.update({
                dashboardParts: newDashboardParts
              });

              this.navigateService.navigateToDashboard({
                dashboardId: this.selectedDashboardId
              });
            } else {
              this.spinner.hide(this.spinnerName);
            }
          }
        }),
        take(1)
      )
      .subscribe();
  }

  selectedChange() {
    this.makePathAndSetValues();
  }

  makePathAndSetValues() {
    if (
      isUndefined(this.selectedDashboardId) ||
      isUndefined(this.dashboardParts)
    ) {
      this.selectedDashboardPath = '';
      return;
    }

    let selectedDashboard = this.dashboardParts.find(
      x => x.dashboardId === this.selectedDashboardId
    );

    if (isDefined(selectedDashboard)) {
      let parts = selectedDashboard.filePath.split('/');

      parts.shift();

      this.selectedDashboardPath = parts.join(' / ');

      this.titleForm.controls['title'].setValue(selectedDashboard.title);
      this.selectedAccessRoles = [...(selectedDashboard.accessRoles || [])];
      this.cd.detectChanges();
    }
  }

  loadRoles() {
    let payload: ToBackendGetRolesRequestPayload = {
      projectId: this.nav.projectId
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetRoles,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetRolesResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.roles = resp.payload.roles.sort((a, b) =>
              a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
            );
            this.cd.detectChanges();
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

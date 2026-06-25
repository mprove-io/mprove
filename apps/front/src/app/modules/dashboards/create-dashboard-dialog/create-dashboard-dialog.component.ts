import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { NgSelectComponent, NgSelectModule } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { TippyDirective } from '@ngneat/helipopper';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { MPROVE_USERS_FOLDER } from '#common/constants/top';
import { APP_SPINNER_NAME } from '#common/constants/top-front';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeId } from '#common/functions/make-id';
import type { DashboardX } from '#common/zod/backend/dashboard-x';
import type { Role } from '#common/zod/backend/role';
import type {
  ToBackendSaveCreateDashboardRequestPayload,
  ToBackendSaveCreateDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-create-dashboard';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { DashboardUnitsQuery } from '#front/app/queries/dashboard-parts.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { UnitsUiService } from '#front/app/services/units-ui.service';
import { SharedModule } from '../../shared/shared.module';

export interface CreateDashboardDialogData {
  apiService: ApiService;
}

@Component({
  selector: 'm-create-dashboard-dialog',
  templateUrl: './create-dashboard-dialog.component.html',
  standalone: true,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    NgSelectModule,
    TippyDirective
  ]
})
export class CreateDashboardDialogComponent implements OnInit {
  @ViewChild('dashboardsCreateDialogRoleSelect', { static: false })
  dashboardsCreateDialogRoleSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.dashboardsCreateDialogRoleSelectElement?.close();
    this.ref.close();
  }

  @ViewChild('dashboardTitle') dashboardTitleElement: ElementRef;

  usersFolder = MPROVE_USERS_FOLDER;

  dashboard: DashboardX;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.maxLength(255)]]
  });

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];

  newDashboardId = makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

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
    public ref: DialogRef<CreateDashboardDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
    private memberQuery: MemberQuery,
    private navigateService: NavigateService,
    private dashboardUnitsQuery: DashboardUnitsQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private cd: ChangeDetectorRef,
    private unitsUiService: UnitsUiService
  ) {}

  ngOnInit() {
    this.nav = this.navQuery.getValue();
    this.loadRoles();

    setTimeout(() => {
      this.dashboardTitleElement.nativeElement.focus();
    }, 0);
  }

  create() {
    this.titleForm.markAllAsTouched();

    if (!this.titleForm.valid) {
      return;
    }

    if (this.titleForm.controls['title'].valid) {
      this.ref.close();

      let newTitle = this.titleForm.controls['title'].value;
      let roles = [...this.selectedAccessRoles];

      this.createDashboard({
        newTitle: newTitle,
        roles: roles
      });
    }
  }

  createDashboard(item: { newTitle: string; roles: string[] }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { newTitle, roles } = item;

    let payload: ToBackendSaveCreateDashboardRequestPayload = {
      projectId: this.nav.projectId,
      repoId: this.nav.repoId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      newDashboardId: this.newDashboardId,
      dashboardTitle: newTitle,
      accessRoles: roles,
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
            let dashboardUnit = resp.payload.newDashboardUnit;
            if (isDefined(dashboardUnit)) {
              let dashboardUnits = this.dashboardUnitsQuery.getValue();

              this.dashboardUnitsQuery.update({
                dashboardUnitDrafts: dashboardUnits.dashboardUnitDrafts.filter(
                  d => d.dashboardId !== dashboardUnit.dashboardId
                ),
                dashboardSpaceNodes:
                  this.unitsUiService.upsertDashboardSpaceUnit({
                    spaceNodes: dashboardUnits.dashboardSpaceNodes,
                    dashboard: dashboardUnit,
                    member: this.memberQuery.getValue()
                  })
              });

              this.navigateService.navigateToDashboard({
                dashboardId: this.newDashboardId
              });
            } else {
              this.spinner.hide(APP_SPINNER_NAME);
            }
          }
        }),
        take(1)
      )
      .subscribe();
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

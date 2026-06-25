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
import {
  APP_SPINNER_NAME,
  EMPTY_SPACE,
  EMPTY_SPACE_NAME
} from '#common/constants/top-front';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import type { DashboardX } from '#common/zod/backend/dashboard-x';
import type { Role } from '#common/zod/backend/role';
import type { Space } from '#common/zod/blockml/space';
import type {
  ToBackendSaveCreateDashboardRequestPayload,
  ToBackendSaveCreateDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-create-dashboard';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { makeUnitDisplayPath } from '#front/app/functions/make-unit-display-path';
import { DashboardUnitsQuery } from '#front/app/queries/dashboard-units.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery, NavState } from '#front/app/queries/nav.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';
import { SharedModule } from '../../shared/shared.module';

export interface CreateDashboardDialogData {
  apiService: ApiService;
}

type SpaceOption = typeof EMPTY_SPACE;

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

  @ViewChild('dashboardsCreateDialogSpaceSelect', { static: false })
  dashboardsCreateDialogSpaceSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.dashboardsCreateDialogRoleSelectElement?.close();
    this.dashboardsCreateDialogSpaceSelectElement?.close();
    this.ref.close();
  }

  @ViewChild('dashboardTitle') dashboardTitleElement: ElementRef;

  emptySpaceName = EMPTY_SPACE_NAME;

  dashboard: DashboardX;
  newDashboardPath: string;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.maxLength(255)]]
  });

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];
  selectedSpace: string;
  combinedAccessRoles: string[] = [];
  combinedAccessRolesText = '';
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];
  canSpecifyDashboardSpace = false;

  newDashboardId = makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      if (this.selectedSpace !== undefined) {
        this.updatePath();
      }
      this.cd.detectChanges();
    })
  );

  nav: NavState;
  nav$ = this.navQuery.select().pipe(
    tap(x => {
      this.nav = x;
      if (this.selectedSpace !== undefined) {
        this.updatePath();
      }
      this.cd.detectChanges();
    })
  );

  struct: StructState;
  struct$ = this.structQuery.select().pipe(
    tap(x => {
      this.struct = x;
      if (this.selectedSpace !== undefined) {
        this.updateCombinedAccessRoles();
        this.updatePath();
      }
      this.cd.detectChanges();
    })
  );

  constructor(
    public ref: DialogRef<CreateDashboardDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private dashboardUnitsQuery: DashboardUnitsQuery,
    private spinner: NgxSpinnerService,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private memberQuery: MemberQuery,
    private cd: ChangeDetectorRef
  ) {}

  makeSpacesPlusEmpty(item: { spaces: Space[] }): SpaceOption[] {
    let { spaces } = item;

    let spaceOptions = (spaces ?? []).map(space => ({
      ...space,
      label: this.makeSpaceLabel({ space: space, spaces: spaces ?? [] })
    }));

    return [makeCopy(EMPTY_SPACE), ...spaceOptions];
  }

  makeSpaceLabel(item: { space: Space; spaces: Space[] }) {
    let { space, spaces } = item;
    let parts = space.space.split('.');
    let currentSpace = '';

    return parts
      .map((part, index) => {
        currentSpace = index === 0 ? part : `${currentSpace}.${part}`;

        let foundSpace = spaces.find(x => x.space === currentSpace);

        return foundSpace?.title || part;
      })
      .join(' - ');
  }

  updateCombinedAccessRoles() {
    let selectedSpace = this.struct?.spaces?.find(
      x => x.space === this.selectedSpace
    );

    this.combinedAccessRoles = [
      ...new Set([
        ...(selectedSpace?.accessRolesCombined ?? []),
        ...this.selectedAccessRoles
      ])
    ];
    this.combinedAccessRolesText = this.combinedAccessRoles.join(', ');
  }

  updatePath() {
    let alias = this.userQuery.getValue().alias;
    let nav = this.navQuery.getValue();
    let struct = this.structQuery.getValue();

    this.newDashboardPath = makeUnitDisplayPath({
      projectId: nav.projectId,
      mproveDirValue: struct.mproveConfig.mproveDirValue,
      userAlias: alias,
      selectedSpace: this.selectedSpace,
      unitId: this.newDashboardId,
      filePath: undefined,
      unitSpace: EMPTY_SPACE_NAME,
      extension: FileExtensionEnum.Dashboard,
      spaces: struct.spaces
    });
  }

  spaceChange() {
    this.updateCombinedAccessRoles();
    this.updatePath();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    this.nav = this.navQuery.getValue();
    this.struct = this.structQuery.getValue();

    this.spacesPlusEmpty = this.makeSpacesPlusEmpty({
      spaces: this.struct.spaces
    });

    let member = this.memberQuery.getValue();

    this.canSpecifyDashboardSpace =
      member.isAdmin === true || member.isEditor === true;

    this.selectedSpace = EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updatePath();

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
      space:
        this.selectedSpace === EMPTY_SPACE_NAME
          ? undefined
          : this.selectedSpace,
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
            if (isUndefined(resp.payload.dashboardSpaceNodes)) {
              this.spinner.hide(APP_SPINNER_NAME);
              return;
            }

            this.dashboardUnitsQuery.update({
              dashboardUnitDrafts: resp.payload.dashboardUnitDrafts,
              dashboardSpaceNodes: resp.payload.dashboardSpaceNodes
            });

            this.navigateService.navigateToDashboard({
              dashboardId: this.newDashboardId
            });
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

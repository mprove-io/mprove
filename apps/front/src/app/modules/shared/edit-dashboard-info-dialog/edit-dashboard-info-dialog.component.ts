import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
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
import { RepoTypeEnum } from '#common/enums/repo-type.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { makeCopy } from '#common/functions/make-copy';
import type { AccessRoleCombined } from '#common/zod/access-role-combined';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { Role } from '#common/zod/backend/role';
import type { Space } from '#common/zod/blockml/space';
import type {
  ToBackendSaveModifyDashboardRequestPayload,
  ToBackendSaveModifyDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-save-modify-dashboard';
import type {
  ToBackendGetRolesRequestPayload,
  ToBackendGetRolesResponse
} from '#common/zod/to-backend/roles/to-backend-get-roles';
import { makeUnitDisplayPath } from '#front/app/functions/make-unit-display-path';
import { setValueAndMark } from '#front/app/functions/set-value-and-mark';
import { DashboardQuery } from '#front/app/queries/dashboard.query';
import { DashboardUnitsQuery } from '#front/app/queries/dashboard-units.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { SharedModule } from '../shared.module';

export interface EditDashboardInfoDialogData {
  apiService: ApiService;
  projectId: string;
  repoId: string;
  repoType: RepoTypeEnum;
  branchId: string;
  envId: string;
  dashboardUnit: DashboardUnit;
}

type SpaceOption = typeof EMPTY_SPACE;

@Component({
  selector: 'm-edit-dashboard-info-dialog',
  templateUrl: './edit-dashboard-info-dialog.component.html',
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
export class EditDashboardInfoDialogComponent implements OnInit {
  @ViewChild('editDashboardInfoDialogRoleSelect', { static: false })
  editDashboardInfoDialogRoleSelectElement: NgSelectComponent;

  @ViewChild('editDashboardInfoDialogSpaceSelect', { static: false })
  editDashboardInfoDialogSpaceSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.editDashboardInfoDialogRoleSelectElement?.close();
    this.editDashboardInfoDialogSpaceSelectElement?.close();
    this.ref.close();
  }

  emptySpaceName = EMPTY_SPACE_NAME;

  dashboardPath: string;

  titleForm: FormGroup = this.fb.group({
    title: [undefined, [Validators.required, Validators.maxLength(255)]]
  });

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];
  selectedSpace: string;
  combinedAccessRoles: AccessRoleCombined[] = [];
  canChangeSpace = false;
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];
  struct: StructState;

  constructor(
    public ref: DialogRef<EditDashboardInfoDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private dashboardUnitsQuery: DashboardUnitsQuery,
    private dashboardQuery: DashboardQuery,
    private spinner: NgxSpinnerService,
    private structQuery: StructQuery,
    private uiQuery: UiQuery,
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

    let combinedAccessRoles = (selectedSpace?.accessRolesCombined ?? []).map(
      x => ({
        role: x.role,
        isDirect: false
      })
    );

    this.selectedAccessRoles.forEach(role => {
      let existingRole = combinedAccessRoles.find(x => x.role === role);

      if (existingRole) {
        existingRole.isDirect = true;
      } else {
        combinedAccessRoles.push({ role: role, isDirect: true });
      }
    });

    this.combinedAccessRoles = combinedAccessRoles;
  }

  spaceChange() {
    this.updateCombinedAccessRoles();
    this.updateDashboardPath();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    let member = this.memberQuery.getValue();

    this.canChangeSpace = member.isAdmin === true || member.isEditor === true;
    this.struct = this.structQuery.getValue();
    this.spacesPlusEmpty = this.makeSpacesPlusEmpty({
      spaces: this.struct.spaces
    });

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.ref.data.dashboardUnit.title
    });

    this.selectedAccessRoles = [
      ...(this.ref.data.dashboardUnit.accessRoles || [])
    ];
    this.selectedSpace = this.ref.data.dashboardUnit.space ?? EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updateDashboardPath();

    this.loadRoles();

    setTimeout(() => {
      (document.activeElement as HTMLElement).blur();
    }, 0);
  }

  updateDashboardPath() {
    let alias = this.userQuery.getValue().alias;

    this.dashboardPath = makeUnitDisplayPath({
      projectId: this.ref.data.projectId,
      mproveDirValue: this.struct.mproveConfig.mproveDirValue,
      userAlias: alias,
      selectedSpace: this.selectedSpace,
      unitId: this.ref.data.dashboardUnit.dashboardId,
      filePath: this.ref.data.dashboardUnit.filePath,
      unitSpace: this.ref.data.dashboardUnit.space,
      extension: FileExtensionEnum.Dashboard,
      spaces: this.struct.spaces
    });
  }

  save() {
    if (this.titleForm.controls['title'].valid) {
      this.spinner.show(APP_SPINNER_NAME);

      this.ref.close();

      let newTitle: string = this.titleForm.controls['title'].value;
      let roles = [...this.selectedAccessRoles];

      let payload: ToBackendSaveModifyDashboardRequestPayload = {
        projectId: this.ref.data.projectId,
        repoId: this.ref.data.repoId,
        branchId: this.ref.data.branchId,
        envId: this.ref.data.envId,
        fromDashboardId: this.ref.data.dashboardUnit.dashboardId,
        toDashboardId: this.ref.data.dashboardUnit.dashboardId,
        dashboardTitle: newTitle.trim(),
        space:
          this.selectedSpace === EMPTY_SPACE_NAME
            ? undefined
            : this.selectedSpace,
        accessRoles: roles,
        tilesGrid: undefined,
        timezone: this.uiQuery.getValue().timezone
      };

      let apiService: ApiService = this.ref.data.apiService;

      apiService
        .req({
          pathInfoName:
            ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard,
          payload: payload,
          showSpinner: true
        })
        .pipe(
          tap(async (resp: ToBackendSaveModifyDashboardResponse) => {
            if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
              let newDashboard = resp.payload.dashboard;

              if (isDefined(newDashboard)) {
                this.dashboardUnitsQuery.update({
                  dashboardUnitDrafts: resp.payload.dashboardUnitDrafts,
                  dashboardSpaceNodes: resp.payload.dashboardSpaceNodes
                });

                let currentDashboard = this.dashboardQuery.getValue();

                if (currentDashboard.dashboardId === newDashboard.dashboardId) {
                  this.dashboardQuery.update(newDashboard);
                }
              }
            }
          }),
          take(1)
        )
        .subscribe();
    }
  }

  loadRoles() {
    let payload: ToBackendGetRolesRequestPayload = {
      projectId: this.ref.data.projectId
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

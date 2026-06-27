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
import {
  APP_SPINNER_NAME,
  EMPTY_SPACE,
  EMPTY_SPACE_NAME
} from '#common/constants/top-front';
import { FileExtensionEnum } from '#common/enums/file-extension.enum';
import { ResponseInfoStatusEnum } from '#common/enums/response-info-status.enum';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { isDefined } from '#common/functions/is-defined';
import { isUndefined } from '#common/functions/is-undefined';
import { makeCopy } from '#common/functions/make-copy';
import { makeId } from '#common/functions/make-id';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { DashboardX } from '#common/zod/backend/dashboard-x';
import type { Role } from '#common/zod/backend/role';
import type { Dashboard } from '#common/zod/blockml/dashboard';
import type { Space } from '#common/zod/blockml/space';
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
import { makeUnitDisplayPath } from '#front/app/functions/make-unit-display-path';
import { DashboardUnitsQuery } from '#front/app/queries/dashboard-units.query';
import { MemberQuery } from '#front/app/queries/member.query';
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
  dashboards: DashboardUnit[];
  dashboard: Dashboard;
}

type SpaceOption = typeof EMPTY_SPACE;

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

  @ViewChild('dashboardSaveAsDialogSpaceSelect', { static: false })
  dashboardSaveAsDialogSpaceSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.dashboardSaveAsDialogExistingDashboardSelectElement?.close();
    this.dashboardSaveAsDialogRoleSelectElement?.close();
    this.dashboardSaveAsDialogSpaceSelectElement?.close();
  }

  emptySpaceName = EMPTY_SPACE_NAME;

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
  selectedSpace: string;
  combinedAccessRoles: string[] = [];
  combinedAccessRolesText = '';
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];
  canSpecifyReportSpace = false;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  selectedDashboardId: any; // string
  selectedDashboardPath: string;
  newDashboardPath: string;

  dashboardUnits: DashboardUnit[];

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
    private memberQuery: MemberQuery,
    private uiQuery: UiQuery,
    private navQuery: NavQuery,
    private structQuery: StructQuery,
    private navigateService: NavigateService,
    private dashboardUnitsQuery: DashboardUnitsQuery,
    private spinner: NgxSpinnerService,
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
        ...(selectedSpace?.accessRolesCombined.map(x => x.role) ?? []),
        ...this.selectedAccessRoles
      ])
    ];
    this.combinedAccessRolesText = this.combinedAccessRoles.join(', ');
  }

  spaceChange() {
    this.updateCombinedAccessRoles();
    this.updatePaths();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    this.dashboard = this.ref.data.dashboard as DashboardX;

    this.struct = this.structQuery.getValue();

    this.spacesPlusEmpty = this.makeSpacesPlusEmpty({
      spaces: this.struct.spaces
    });

    let member = this.memberQuery.getValue();

    this.canSpecifyReportSpace =
      member.isAdmin === true || member.isEditor === true;

    let userAlias = this.userQuery.getValue().alias;

    this.selectedDashboardId =
      this.dashboard.draft === false &&
      this.dashboard.canEditOrDeleteDashboard === true
        ? this.dashboard.dashboardId
        : undefined;

    this.selectedAccessRoles = [...(this.dashboard.accessRoles || [])];
    this.selectedSpace = this.dashboard.space ?? EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();

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

    this.dashboardUnits = this.ref.data.dashboards
      .filter(
        d => this.canSpecifyReportSpace === true || d.author === userAlias
      )
      .map(x => {
        (x as any).disabled = x.canEditOrDeleteDashboard === false;
        return x;
      });

    this.updatePaths();
    this.makePathAndSetValues();

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
    this.selectedSpace = EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updatePaths();
  }

  existingDashboardOnClick() {
    this.saveAs = DashboardSaveAsEnum.REPLACE_EXISTING_DASHBOARD;
    this.selectedDashboardId = undefined;
    this.selectedDashboardPath = '';
    this.titleForm.controls['title'].setValue(undefined);
    this.selectedAccessRoles = [];
    this.selectedSpace = EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();
    this.updatePaths();
  }

  existingDashboardSearchFn(term: string, dashboardUnit: DashboardUnit) {
    let trimmedTerm = term?.trim();

    if (!trimmedTerm) {
      return true;
    }

    let haystack = [
      `${isDefined(dashboardUnit.title) ? dashboardUnit.title : dashboardUnit.dashboardId} ${dashboardUnit.author ?? ''}`
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
      space:
        this.selectedSpace === EMPTY_SPACE_NAME
          ? undefined
          : this.selectedSpace,
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
      space:
        this.selectedSpace === EMPTY_SPACE_NAME
          ? undefined
          : this.selectedSpace,
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
            if (isUndefined(resp.payload.dashboardSpaceNodes)) {
              this.spinner.hide(APP_SPINNER_NAME);
              return;
            }

            this.dashboardUnitsQuery.update({
              dashboardUnitDrafts: resp.payload.dashboardUnitDrafts,
              dashboardSpaceNodes: resp.payload.dashboardSpaceNodes
            });

            this.navigateService.navigateToDashboard({
              dashboardId: this.selectedDashboardId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  selectedChange() {
    this.makePathAndSetValues();
  }

  updatePaths() {
    let alias = this.userQuery.getValue().alias;
    let nav = this.navQuery.getValue();

    this.newDashboardPath = makeUnitDisplayPath({
      projectId: nav.projectId,
      mproveDirValue: this.struct.mproveConfig.mproveDirValue,
      userAlias: alias,
      selectedSpace: this.selectedSpace,
      unitId: this.newDashboardId,
      filePath: undefined,
      unitSpace: EMPTY_SPACE_NAME,
      extension: FileExtensionEnum.Dashboard,
      spaces: this.struct.spaces
    });

    if (
      isUndefined(this.selectedDashboardId) ||
      isUndefined(this.dashboardUnits)
    ) {
      this.selectedDashboardPath = '';
      return;
    }

    let selectedDashboard = this.dashboardUnits.find(
      x => x.dashboardId === this.selectedDashboardId
    );

    if (isDefined(selectedDashboard)) {
      this.selectedDashboardPath = makeUnitDisplayPath({
        projectId: nav.projectId,
        mproveDirValue: this.struct.mproveConfig.mproveDirValue,
        userAlias: alias,
        selectedSpace: this.selectedSpace,
        unitId: selectedDashboard.dashboardId,
        filePath: selectedDashboard.filePath,
        unitSpace: selectedDashboard.space,
        extension: FileExtensionEnum.Dashboard,
        spaces: this.struct.spaces
      });
    }
  }

  makePathAndSetValues() {
    if (
      isUndefined(this.selectedDashboardId) ||
      isUndefined(this.dashboardUnits)
    ) {
      this.selectedDashboardPath = '';
      return;
    }

    let selectedDashboard = this.dashboardUnits.find(
      x => x.dashboardId === this.selectedDashboardId
    );

    if (isDefined(selectedDashboard)) {
      this.titleForm.controls['title'].setValue(selectedDashboard.title);
      this.selectedAccessRoles = [...(selectedDashboard.accessRoles || [])];
      this.selectedSpace = selectedDashboard.space ?? EMPTY_SPACE.space;
      this.updateCombinedAccessRoles();
      this.updatePaths();
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

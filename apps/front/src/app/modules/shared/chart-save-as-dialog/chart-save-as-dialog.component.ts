import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { NgSelectComponent } from '@ng-select/ng-select';
import { DialogRef } from '@ngneat/dialog';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import {
  TILE_DEFAULT_PLATE_HEIGHT,
  TILE_DEFAULT_PLATE_WIDTH,
  TILE_DEFAULT_PLATE_X,
  TILE_DEFAULT_PLATE_Y
} from '#common/constants/top';
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
import { makeSpaceUnits } from '#common/functions/space/make-space-units';
import { spaceUnitToDashboardUnit } from '#common/functions/space/space-unit-to-dashboard-unit';
import type { AccessRoleCombined } from '#common/zod/access-role-combined';
import type { ChartX } from '#common/zod/backend/chart-x';
import type { DashboardUnit } from '#common/zod/backend/dashboard-unit';
import type { DashboardX } from '#common/zod/backend/dashboard-x';
import type { Role } from '#common/zod/backend/role';
import type { TileX } from '#common/zod/backend/tile-x';
import type { Chart } from '#common/zod/blockml/chart';
import type { Model } from '#common/zod/blockml/model';
import type { Space } from '#common/zod/blockml/space';
import type {
  ToBackendSaveCreateChartRequestPayload,
  ToBackendSaveCreateChartResponse
} from '#common/zod/to-backend/charts/to-backend-save-create-chart';
import type {
  ToBackendGetDashboardRequestPayload,
  ToBackendGetDashboardResponse
} from '#common/zod/to-backend/dashboards/to-backend-get-dashboard';
import type {
  ToBackendGetDashboardsRequestPayload,
  ToBackendGetDashboardsResponse
} from '#common/zod/to-backend/dashboards/to-backend-get-dashboards';
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
import { ChartsQuery } from '#front/app/queries/charts.query';
import { MemberQuery } from '#front/app/queries/member.query';
import { NavQuery } from '#front/app/queries/nav.query';
import { StructQuery, StructState } from '#front/app/queries/struct.query';
import { UiQuery } from '#front/app/queries/ui.query';
import { UserQuery } from '#front/app/queries/user.query';
import { ApiService } from '#front/app/services/api.service';
import { NavigateService } from '#front/app/services/navigate.service';

enum ChartSaveAsEnum {
  NEW_CHART = 'NEW_CHART',
  TILE_OF_DASHBOARD = 'TILE_OF_DASHBOARD'
}

enum TileSaveAsEnum {
  NEW_TILE = 'NEW_TILE',
  REPLACE_EXISTING_TILE = 'REPLACE_EXISTING_TILE'
}

export interface ChartSaveAsDialogData {
  apiService: ApiService;
  chart: Chart;
  model: Model;
}

type SpaceOption = typeof EMPTY_SPACE;

@Component({
  standalone: false,
  selector: 'm-chart-save-as-dialog',
  templateUrl: './chart-save-as-dialog.component.html'
})
export class ChartSaveAsDialogComponent implements OnInit {
  @ViewChild('chartSaveAsDialogDashboardSelect', { static: false })
  chartSaveAsDialogDashboardSelectElement: NgSelectComponent;

  @ViewChild('chartSaveAsDialogTileSelect', { static: false })
  chartSaveAsDialogTileSelectElement: NgSelectComponent;

  @ViewChild('chartSaveAsDialogRoleSelect', { static: false })
  chartSaveAsDialogRoleSelectElement: NgSelectComponent;

  @ViewChild('chartSaveAsDialogSpaceSelect', { static: false })
  chartSaveAsDialogSpaceSelectElement: NgSelectComponent;

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.chartSaveAsDialogDashboardSelectElement?.close();
    this.chartSaveAsDialogTileSelectElement?.close();
    this.chartSaveAsDialogRoleSelectElement?.close();
    this.chartSaveAsDialogSpaceSelectElement?.close();
  }

  emptySpaceName = EMPTY_SPACE_NAME;

  selectedDashboardSpinnerName = 'chartSaveAsDashboardSpinnerName';

  selectedDashboardLoaded = false;

  chartSaveAsEnum = ChartSaveAsEnum;
  tileSaveAsEnum = TileSaveAsEnum;

  spinnerName = 'chartSaveAs';

  chart: ChartX;

  newChartId = makeId();

  titleForm: FormGroup = this.fb.group(
    {
      title: [undefined, [Validators.required, Validators.maxLength(255)]]
    },
    {
      validator: this.titleValidator.bind(this)
    }
  );

  chartSaveAs: ChartSaveAsEnum = ChartSaveAsEnum.NEW_CHART;
  tileSaveAs: TileSaveAsEnum = TileSaveAsEnum.NEW_TILE;

  selectedDashboardId: any; // string
  selectedDashboardPath: string;
  selectedDashboard: DashboardX;

  newChartPath = '';

  selectedTileTitle: any; // string

  dashboardUnits: DashboardUnit[];

  roles: Role[] = [];
  selectedAccessRoles: string[] = [];
  selectedSpace: string;
  combinedAccessRoles: AccessRoleCombined[] = [];
  spacesPlusEmpty: SpaceOption[] = [makeCopy(EMPTY_SPACE)];
  canSpecifyChartSpace = false;
  struct: StructState;

  constructor(
    public ref: DialogRef<ChartSaveAsDialogData>,
    private fb: FormBuilder,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private uiQuery: UiQuery,
    private navigateService: NavigateService,
    private navQuery: NavQuery,
    private chartsQuery: ChartsQuery,
    private structQuery: StructQuery,
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
    this.updateNewChartPath();
  }

  accessRolesChange() {
    this.updateCombinedAccessRoles();
  }

  ngOnInit() {
    this.chart = this.ref.data.chart as ChartX;

    let member = this.memberQuery.getValue();

    this.canSpecifyChartSpace =
      member.isAdmin === true || member.isEditor === true;

    this.struct = this.structQuery.getValue();

    this.spacesPlusEmpty = this.makeSpacesPlusEmpty({
      spaces: this.struct.spaces
    });

    this.selectedAccessRoles = [...(this.chart.accessRoles || [])];
    this.selectedSpace = this.chart.space ?? EMPTY_SPACE.space;
    this.updateCombinedAccessRoles();

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.chart.tiles[0].mconfig.chart.title
    });

    let nav = this.navQuery.getValue();

    this.updateNewChartPath();
    this.loadRoles();

    let payload: ToBackendGetDashboardsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      repoId: nav.repoId
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
            this.dashboardUnits = [
              ...resp.payload.dashboardUnitDrafts,
              ...makeSpaceUnits({
                spaceNodes: resp.payload.dashboardSpaceNodes
              }).map(spaceUnit =>
                spaceUnitToDashboardUnit({ spaceUnit: spaceUnit })
              )
            ].map(x => {
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
    if (isUndefined(this.titleForm)) {
      return null;
    }

    let title: string = this.titleForm.controls['title'].value.toUpperCase();

    if (
      this.chartSaveAs === this.chartSaveAsEnum.TILE_OF_DASHBOARD &&
      isDefined(this.selectedDashboard)
    ) {
      let titles = this.selectedDashboard.tiles.map(x => x.title.toUpperCase());

      if (
        this.tileSaveAs === this.tileSaveAsEnum.NEW_TILE &&
        titles.indexOf(title) > -1
      ) {
        this.titleForm.controls['title'].setErrors({ titleIsNotUnique: true });
      } else if (
        this.tileSaveAs === this.tileSaveAsEnum.REPLACE_EXISTING_TILE &&
        titles.indexOf(title) > -1 &&
        title !== this.selectedTileTitle?.toUpperCase()
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
    let saveDisabled = this.isSaveDisabled();

    if (this.titleForm.controls['title'].valid && saveDisabled === false) {
      let newTitle = this.titleForm.controls['title'].value;

      if (this.chartSaveAs === ChartSaveAsEnum.NEW_CHART) {
        this.ref.close();

        this.saveAsNewChart({
          newTitle: newTitle
        });
      } else if (this.chartSaveAs === ChartSaveAsEnum.TILE_OF_DASHBOARD) {
        this.ref.close();
        this.saveAsTile({ newTitle: newTitle });
      }
    }
  }

  isSaveDisabled() {
    let titleInvalid = this.titleForm.controls['title'].invalid;
    let dashboardNotSelected = this.selectedDashboardId === undefined;
    let dashboardNotLoaded = this.selectedDashboardLoaded === false;
    let tileNotSelected = this.selectedTileTitle === undefined;
    let replaceExistingTile =
      this.tileSaveAs === TileSaveAsEnum.REPLACE_EXISTING_TILE;
    let tileOfDashboard =
      this.chartSaveAs === ChartSaveAsEnum.TILE_OF_DASHBOARD;

    return (
      titleInvalid ||
      (tileOfDashboard &&
        (dashboardNotSelected ||
          dashboardNotLoaded ||
          (replaceExistingTile && tileNotSelected)))
    );
  }

  newChartOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.NEW_CHART;
    this.selectedDashboardId = undefined;
    this.selectedDashboardPath = '';
    this.selectedDashboard = undefined;
    this.selectedDashboardLoaded = false;
    this.selectedTileTitle = undefined;
    this.tileSaveAs = TileSaveAsEnum.NEW_TILE;
    this.updateNewChartPath();
    this.titleForm.get('title').updateValueAndValidity();
  }

  tileOfDashboardOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.TILE_OF_DASHBOARD;
    this.selectedDashboardId = undefined;
    this.selectedDashboardPath = '';
    this.selectedDashboard = undefined;
    this.selectedDashboardLoaded = false;
    this.selectedTileTitle = undefined;
    this.tileSaveAs = TileSaveAsEnum.NEW_TILE;
    this.titleForm.get('title').updateValueAndValidity();
  }

  newTileOnClick() {
    this.tileSaveAs = TileSaveAsEnum.NEW_TILE;
    this.selectedTileTitle = undefined;
    this.titleForm.get('title').updateValueAndValidity();
  }

  replaceExistingTileOnClick() {
    this.tileSaveAs = TileSaveAsEnum.REPLACE_EXISTING_TILE;
    this.selectedTileTitle = undefined;
    this.titleForm.get('title').updateValueAndValidity();
  }

  selectedDashboardChange() {
    this.selectedTileTitle = undefined;
    this.selectedDashboard = undefined;
    this.setSelectedDashboard();
    this.makePath();
    this.titleForm.get('title').updateValueAndValidity();
  }

  selectedTileChange() {
    this.titleForm.get('title').updateValueAndValidity();
  }

  setSelectedDashboard() {
    if (
      isUndefined(this.selectedDashboardId) ||
      isUndefined(this.dashboardUnits)
    ) {
      this.selectedDashboardPath = '';
      return;
    }

    this.selectedDashboardLoaded = false;

    let nav = this.navQuery.getValue();

    let apiService: ApiService = this.ref.data.apiService;

    this.spinner.show(this.selectedDashboardSpinnerName);

    let selectedDashboardId = this.selectedDashboardId;

    let payload: ToBackendGetDashboardRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      dashboardId: selectedDashboardId,
      timezone: 'UTC'
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendGetDashboard,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendGetDashboardResponse) => {
          let isSelectedDashboard =
            selectedDashboardId === this.selectedDashboardId;

          if (
            resp.info?.status === ResponseInfoStatusEnum.Ok &&
            isSelectedDashboard
          ) {
            this.selectedDashboard = resp.payload.dashboard;

            this.selectedDashboardLoaded = true;

            this.titleForm.get('title').updateValueAndValidity();

            this.spinner.hide(this.selectedDashboardSpinnerName);

            this.cd.detectChanges();
          }
        })
      )
      .toPromise();
  }

  makePath() {
    if (
      isUndefined(this.selectedDashboardId) ||
      isUndefined(this.dashboardUnits)
    ) {
      return;
    }

    let selectedDashboard = this.dashboardUnits.find(
      x => x.dashboardId === this.selectedDashboardId
    );

    if (isDefined(selectedDashboard)) {
      let parts = selectedDashboard.filePath.split('/');

      parts.shift();

      this.selectedDashboardPath = parts.join(' / ');
    }
  }

  saveAsNewChart(item: { newTitle: string }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { newTitle } = item;
    let nav = this.navQuery.getValue();

    let payload: ToBackendSaveCreateChartRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      fromChartId: this.chart.chartId,
      newChartId: this.newChartId,
      tileTitle: newTitle.trim(),
      space:
        this.selectedSpace === EMPTY_SPACE_NAME
          ? undefined
          : this.selectedSpace,
      accessRoles: [...this.selectedAccessRoles],
      mconfig: this.chart.tiles[0].mconfig
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveCreateChart,
        payload: payload
      })
      .pipe(
        tap((resp: ToBackendSaveCreateChartResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            let newChart = resp.payload.chart;

            if (isDefined(newChart)) {
              this.chartsQuery.update({
                chartUnitDrafts: resp.payload.chartUnitDrafts,
                chartSpaceNodes: resp.payload.chartSpaceNodes
              });

              this.navigateService.navigateToChart({
                modelId: newChart.modelId,
                chartId: newChart.chartId
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

  async saveAsTile(item: { newTitle: string }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { newTitle } = item;

    let apiService: ApiService = this.ref.data.apiService;
    let nav = this.navQuery.getValue();

    let newTile: TileX = {
      mconfig: this.chart.tiles[0].mconfig,
      modelId: this.chart.tiles[0].mconfig.modelId,
      modelLabel: this.ref.data.model.label,
      modelFilePath: this.ref.data.model.filePath,
      mconfigId: this.chart.tiles[0].mconfig.mconfigId,
      queryId: this.chart.tiles[0].mconfig.queryId,
      trackChangeId: makeId(),
      listen: {},
      deletedFilterFieldIds: undefined,
      hasAccessToModel: true,
      title: newTitle.trim(),
      plateWidth: TILE_DEFAULT_PLATE_WIDTH,
      plateHeight: TILE_DEFAULT_PLATE_HEIGHT,
      plateX: TILE_DEFAULT_PLATE_X,
      plateY: TILE_DEFAULT_PLATE_Y // recalculated on backend
    };

    let payloadModifyDashboard: ToBackendSaveModifyDashboardRequestPayload = {
      projectId: nav.projectId,
      repoId: nav.repoId,
      branchId: nav.branchId,
      envId: nav.envId,
      toDashboardId: this.selectedDashboardId,
      fromDashboardId: this.selectedDashboardId,
      selectedTileTitle: this.selectedTileTitle,
      newTile: newTile,
      isReplaceTile: this.tileSaveAs === TileSaveAsEnum.REPLACE_EXISTING_TILE,
      timezone: this.uiQuery.getValue().timezone
    };

    apiService
      .req({
        pathInfoName: ToBackendRequestInfoNameEnum.ToBackendSaveModifyDashboard,
        payload: payloadModifyDashboard
      })
      .pipe(
        tap((resp: ToBackendSaveModifyDashboardResponse) => {
          if (resp.info?.status === ResponseInfoStatusEnum.Ok) {
            this.navigateService.navigateToDashboard({
              dashboardId: this.selectedDashboardId
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  cancel() {
    this.ref.close();
  }

  updateNewChartPath() {
    let alias = this.userQuery.getValue().alias;
    let nav = this.navQuery.getValue();

    this.newChartPath = makeUnitDisplayPath({
      projectId: nav.projectId,
      mproveDirValue: this.struct.mproveConfig.mproveDirValue,
      userAlias: alias,
      selectedSpace: this.selectedSpace,
      unitId: this.newChartId,
      filePath: undefined,
      unitSpace: EMPTY_SPACE_NAME,
      extension: FileExtensionEnum.Chart,
      spaces: this.struct.spaces
    });
  }

  loadRoles() {
    let nav = this.navQuery.getValue();

    let payload: ToBackendGetRolesRequestPayload = {
      projectId: nav.projectId
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
            let newSortedRoles = resp.payload.roles.sort((a, b) =>
              a.roleId > b.roleId ? 1 : b.roleId > a.roleId ? -1 : 0
            );

            this.roles = newSortedRoles;
            this.cd.detectChanges();
          }
        }),
        take(1)
      )
      .subscribe();
  }
}

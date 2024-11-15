import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit
} from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
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
  mconfig: common.MconfigX;
  query: common.Query;
  model: common.Model;
}

@Component({
  selector: 'm-chart-save-as-dialog',
  templateUrl: './chart-save-as-dialog.component.html'
})
export class ChartSaveAsDialogComponent implements OnInit {
  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.ref.close();
  }

  usersFolder = common.MPROVE_USERS_FOLDER;

  chartSaveAsEnum = ChartSaveAsEnum;
  tileSaveAsEnum = TileSaveAsEnum;

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

  chartSaveAs: ChartSaveAsEnum = ChartSaveAsEnum.NEW_CHART;
  tileSaveAs: TileSaveAsEnum = TileSaveAsEnum.NEW_TILE;

  chartId = common.makeId();

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  selectedDashboardId: any; // string
  selectedDashboardPath: string;
  selectedDashboard: common.DashboardX;

  selectedTileTitle: any; // string

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
      this.chartSaveAs === this.chartSaveAsEnum.TILE_OF_DASHBOARD &&
      common.isDefined(this.selectedDashboard)
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
    if (this.titleForm.controls['title'].valid) {
      let newTitle = this.titleForm.controls['title'].value;

      if (
        this.chartSaveAs === ChartSaveAsEnum.NEW_CHART &&
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
      } else if (this.chartSaveAs === ChartSaveAsEnum.TILE_OF_DASHBOARD) {
        this.ref.close();
        this.saveAsTile({ newTitle: newTitle });
      }
    }
  }

  newVizOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.NEW_CHART;
    this.titleForm.get('title').updateValueAndValidity();
  }

  tileOfDashboardOnClick() {
    this.chartSaveAs = ChartSaveAsEnum.TILE_OF_DASHBOARD;
    this.titleForm.get('title').updateValueAndValidity();
  }

  newTileOnClick() {
    this.tileSaveAs = TileSaveAsEnum.NEW_TILE;
    this.titleForm.get('title').updateValueAndValidity();
  }

  replaceExistingTileOnClick() {
    this.tileSaveAs = TileSaveAsEnum.REPLACE_EXISTING_TILE;
    this.titleForm.get('title').updateValueAndValidity();
  }

  selectedDashboardChange() {
    this.selectedTileTitle = undefined;
    this.setSelectedDashboard();
    this.makePath();
    this.titleForm.get('title').updateValueAndValidity();
  }

  selectedTileChange() {
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

    let payload: apiToBackend.ToBackendCreateChartRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      chartId: this.chartId,
      tileTitle: newTitle.trim(),
      accessRoles: roles,
      accessUsers: users,
      mconfig: this.ref.data.mconfig
    };

    let apiService: ApiService = this.ref.data.apiService;

    apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateChart,
        payload: payload
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendCreateChartResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.navigateService.navigateToVizs({
              extra: {
                queryParams: { search: resp.payload.viz.chartId }
              }
            });
          }
        }),
        take(1)
      )
      .subscribe();
  }

  async saveAsTile(item: { newTitle: string }) {
    this.spinner.show(constants.APP_SPINNER_NAME);

    let { newTitle } = item;

    let apiService: ApiService = this.ref.data.apiService;

    let newTile: common.TileX = {
      mconfig: this.ref.data.mconfig,
      modelId: this.ref.data.mconfig.modelId,
      modelLabel: this.ref.data.model.label,
      mconfigId: this.ref.data.mconfig.mconfigId,
      timezone: this.ref.data.mconfig.timezone,
      listen: {},
      queryId: this.ref.data.mconfig.queryId,
      hasAccessToModel: true,
      title: newTitle.trim(),
      plateWidth: common.TILE_DEFAULT_PLATE_WIDTH,
      plateHeight: common.TILE_DEFAULT_PLATE_HEIGHT,
      plateX: common.TILE_DEFAULT_PLATE_X,
      plateY: common.TILE_DEFAULT_PLATE_Y // recalculated on backend
    };

    let payloadModifyDashboard: apiToBackend.ToBackendModifyDashboardRequestPayload =
      {
        projectId: this.nav.projectId,
        isRepoProd: this.nav.isRepoProd,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        toDashboardId: this.selectedDashboardId,
        fromDashboardId: this.selectedDashboardId,
        selectedTileTitle: this.selectedTileTitle,
        newTile: newTile,
        isReplaceTile: this.tileSaveAs === TileSaveAsEnum.REPLACE_EXISTING_TILE
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

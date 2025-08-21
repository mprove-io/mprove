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
import { setValueAndMark } from '~front/app/functions/set-value-and-mark';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { StructQuery, StructState } from '~front/app/queries/struct.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { NavigateService } from '~front/app/services/navigate.service';

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

  @HostListener('window:keyup.esc')
  onEscKeyUp() {
    this.chartSaveAsDialogDashboardSelectElement?.close();
    this.chartSaveAsDialogTileSelectElement?.close();
    // this.ref.close();
  }

  usersFolder = MPROVE_USERS_FOLDER;

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

  rolesForm: FormGroup = this.fb.group({
    roles: [undefined, [Validators.maxLength(255)]]
  });

  chartSaveAs: ChartSaveAsEnum = ChartSaveAsEnum.NEW_CHART;
  tileSaveAs: TileSaveAsEnum = TileSaveAsEnum.NEW_TILE;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  selectedDashboardId: any; // string
  selectedDashboardPath: string;
  selectedDashboard: DashboardX;

  selectedTileTitle: any; // string

  dashboards: DashboardX[];

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
    private chartsQuery: ChartsQuery,
    private structQuery: StructQuery,
    private spinner: NgxSpinnerService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.chart = this.ref.data.chart as ChartX;

    setValueAndMark({
      control: this.titleForm.controls['title'],
      value: this.chart.tiles[0].mconfig.chart.title
    });
    setValueAndMark({
      control: this.rolesForm.controls['roles'],
      value: this.ref.data.model.accessRoles?.join(', ')
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

    let payload: ToBackendGetDashboardsRequestPayload = {
      projectId: nav.projectId,
      branchId: nav.branchId,
      envId: nav.envId,
      isRepoProd: nav.isRepoProd
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
    if (this.titleForm.controls['title'].valid) {
      let newTitle = this.titleForm.controls['title'].value;

      if (
        this.chartSaveAs === ChartSaveAsEnum.NEW_CHART &&
        this.rolesForm.controls['roles'].valid
      ) {
        this.ref.close();
        let roles = this.rolesForm.controls['roles'].value;

        this.saveAsNewChart({
          newTitle: newTitle,
          roles: roles
        });
      } else if (this.chartSaveAs === ChartSaveAsEnum.TILE_OF_DASHBOARD) {
        this.ref.close();
        this.saveAsTile({ newTitle: newTitle });
      }
    }
  }

  newChartOnClick() {
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
    if (isUndefined(this.selectedDashboardId) || isUndefined(this.dashboards)) {
      return;
    }

    this.selectedDashboard = this.dashboards.find(
      x => x.dashboardId === this.selectedDashboardId
    );
  }

  makePath() {
    if (isUndefined(this.selectedDashboardId) || isUndefined(this.dashboards)) {
      return;
    }

    let selectedDashboard = this.dashboards.find(
      x => x.dashboardId === this.selectedDashboardId
    );

    if (isDefined(selectedDashboard)) {
      let parts = selectedDashboard.filePath.split('/');

      parts.shift();

      this.selectedDashboardPath = parts.join(' / ');
    }
  }

  saveAsNewChart(item: { newTitle: string; roles: string }) {
    this.spinner.show(APP_SPINNER_NAME);

    let { newTitle, roles } = item;

    let payload: ToBackendSaveCreateChartRequestPayload = {
      projectId: this.nav.projectId,
      isRepoProd: this.nav.isRepoProd,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      fromChartId: this.chart.chartId,
      newChartId: this.newChartId,
      tileTitle: newTitle.trim(),
      accessRoles: roles,
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
              let charts = this.chartsQuery.getValue().charts;

              let newCharts = [
                newChart,
                ...charts.filter(
                  x =>
                    x.chartId !== newChart.chartId &&
                    !(x.draft === true && x.chartId === this.chart.chartId)
                )
              ];

              this.chartsQuery.update({ charts: newCharts });

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

    let newTile: TileX = {
      mconfig: this.chart.tiles[0].mconfig,
      modelId: this.chart.tiles[0].mconfig.modelId,
      modelLabel: this.ref.data.model.label,
      modelFilePath: this.ref.data.model.filePath,
      mconfigId: this.chart.tiles[0].mconfig.mconfigId,
      // malloyQueryId: undefined,
      listen: {},
      deletedFilterFieldIds: undefined,
      queryId: this.chart.tiles[0].mconfig.queryId,
      hasAccessToModel: true,
      title: newTitle.trim(),
      plateWidth: TILE_DEFAULT_PLATE_WIDTH,
      plateHeight: TILE_DEFAULT_PLATE_HEIGHT,
      plateX: TILE_DEFAULT_PLATE_X,
      plateY: TILE_DEFAULT_PLATE_Y // recalculated on backend
    };

    let payloadModifyDashboard: ToBackendSaveModifyDashboardRequestPayload = {
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
}

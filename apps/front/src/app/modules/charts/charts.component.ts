import { Location } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnDestroy,
  OnInit
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { ChartsQuery } from '~front/app/queries/charts.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

import { FormBuilder } from '@angular/forms';
import uFuzzy from '@leeoniya/ufuzzy';
import { StructQuery } from '~front/app/queries/struct.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { DataService } from '~front/app/services/data.service';
import { UiService } from '~front/app/services/ui.service';

class ModelXWithTotalCharts extends common.ModelX {
  totalCharts: number;
}

@Component({
  selector: 'm-charts',
  templateUrl: './charts.component.html'
})
export class ChartsComponent implements OnInit, OnDestroy {
  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  pageTitle = constants.CHARTS_PAGE_TITLE;

  chartDeletedFnBindThis = this.chartDeletedFn.bind(this);

  // groups: string[];

  showList = true;
  showBricks = false;

  isShow = true;

  chartsModels: ModelXWithTotalCharts[];
  hasAccessModels: common.ModelX[] = [];

  charts: common.ChartX[];
  chartsFilteredByWord: common.ChartX[];
  filteredCharts: common.ChartX[];
  filteredChartRows: common.ChartX[][] = [];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
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

  member: common.Member;
  member$ = this.memberQuery.select().pipe(
    tap(x => {
      this.member = x;
      this.cd.detectChanges();
    })
  );

  charts$ = this.chartsQuery.select().pipe(
    tap(x => {
      this.charts = x.charts;

      this.modelsQuery
        .select()
        .pipe(take(1))
        .subscribe(y => {
          this.hasAccessModels = y.models.filter(m => m.hasAccess === true);

          this.chartsModels = y.models.map(m =>
            Object.assign({}, m, <ModelXWithTotalCharts>{
              totalCharts: this.charts.filter(v => v.modelId === m.modelId)
                .length
            })
          );

          // let allGroups = this.vizs.map(v => v.gr);
          // let definedGroups = allGroups.filter(y => common.isDefined(y));
          // this.groups = [...new Set(definedGroups)];

          this.makeFilteredCharts();

          this.cd.detectChanges();
        });
    })
  );

  modelId: string;

  word: string;
  // fileName: string;

  screenAspectRatio: number;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  private timer: any;

  timezoneForm = this.fb.group({
    timezone: [
      {
        value: undefined
      }
    ]
  });

  timezones = common.getTimezones();

  struct$ = this.structQuery.select().pipe(
    tap(x => {
      if (x.allowTimezones === false) {
        this.timezoneForm.controls['timezone'].disable();
      } else {
        this.timezoneForm.controls['timezone'].enable();
      }
    })
  );

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private modelsQuery: ModelsQuery,
    private chartsQuery: ChartsQuery,
    private userQuery: UserQuery,
    private memberQuery: MemberQuery,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private dataService: DataService,
    private myDialogService: MyDialogService,
    private spinner: NgxSpinnerService,
    private navigateService: NavigateService,
    private uiQuery: UiQuery,
    private uiService: UiService,
    private location: Location,
    private structQuery: StructQuery,
    private title: Title
  ) {}

  calculateAspectRatio() {
    this.screenAspectRatio = window.innerWidth / window.innerHeight;
    // console.log('screenAspectRatio');

    // console.log(this.screenAspectRatio);
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.calculateAspectRatio();
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyVizs')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  ngOnInit() {
    this.calculateAspectRatio();

    this.title.setTitle(this.pageTitle);

    let uiState = this.uiQuery.getValue();

    let timezoneParam = this.route.snapshot.queryParamMap.get('timezone');

    let structState = this.structQuery.getValue();

    let timezone =
      structState.allowTimezones === false
        ? structState.defaultTimezone
        : common.isDefined(timezoneParam)
        ? timezoneParam.split('-').join('/')
        : uiState.timezone;

    if (uiState.timezone !== timezone) {
      this.uiQuery.updatePart({ timezone: timezone });
      this.uiService.setUserUi({ timezone: timezone });
    }

    this.timezoneForm.controls['timezone'].setValue(timezone);

    // let searchFileName = this.route.snapshot.queryParamMap.get(
    //   'searchFileName'
    // );
    // if (common.isDefined(searchFileName)) {
    //   let fileNameAr = searchFileName.split('.');
    //   fileNameAr.pop();
    //   this.fileName = fileNameAr.join('.');
    // }

    this.word = this.route.snapshot.queryParamMap.get('search');
    this.searchWordChange();

    if (
      common.isDefined(this.word) ||
      common.isUndefined(timezoneParam) ||
      timezoneParam !== timezone
    ) {
      if (common.isDefined(this.word)) {
        this.showList = false;
      }

      let url = this.router
        .createUrlTree([], {
          relativeTo: this.route,
          queryParams: { timezone: timezone.split('/').join('-') }
        })
        .toString();

      this.location.go(url);
    }
  }

  modelOnClick(modelId: string) {
    if (this.modelId === modelId) {
      return;
    }

    this.modelId = modelId;
    this.makeFilteredCharts();
  }

  allModelsOnClick() {
    if (common.isUndefined(this.modelId)) {
      return;
    }

    this.modelId = undefined;
    this.makeFilteredCharts();
  }

  makeFilteredCharts() {
    let idxs;

    if (common.isDefinedAndNotEmpty(this.word)) {
      let haystack = this.charts.map(x => `${x.title} ${x.chartId}`);
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.chartsFilteredByWord = common.isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map(idx => this.charts[idx])
        : []
      : this.charts;

    this.filteredCharts = common.isDefined(this.modelId)
      ? this.chartsFilteredByWord.filter(v => v.modelId === this.modelId)
      : this.chartsFilteredByWord;

    this.filteredCharts = this.filteredCharts.sort((a, b) => {
      let aTitle = a.title || a.chartId;
      let bTitle = b.title || b.chartId;

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    this.filteredChartRows = [];
    for (let i = 0; i < this.filteredCharts.length; i += 2) {
      this.filteredChartRows.push(this.filteredCharts.slice(i, i + 2));
    }

    this.chartsModels = this.chartsModels
      .map(x =>
        Object.assign({}, x, {
          totalCharts: this.chartsFilteredByWord.filter(
            v => v.modelId === x.modelId
          ).length
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
  }

  chartDeletedFn(deletedChartId: string) {
    this.charts = this.charts.filter(x => x.chartId !== deletedChartId);

    this.makeFilteredCharts();
    this.cd.detectChanges();
  }

  trackByFn(index: number, item: common.ChartX) {
    return item.chartId;
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredCharts();
      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredCharts();
    this.cd.detectChanges();
  }

  newChart() {
    this.myDialogService.showNewChart({
      models: this.hasAccessModels
    });
  }

  refreshShow() {
    // this.isShow = false;
    // setTimeout(() => {
    //   this.isShow = true;
    // });
  }

  setShowListTrue() {
    if (this.showList === true) {
      return;
    }

    this.showList = true;
    this.refreshShow();
  }

  setShowListFalse() {
    if (this.showList === false) {
      return;
    }

    this.showList = false;
    this.refreshShow();
  }

  toggleShowFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  navigateToChart(chartId: string) {}

  explore(event: any, item: common.ChartX) {
    event.stopPropagation();

    this.navigateService.navigateMconfigQuery({
      modelId: item.tiles[0].modelId,
      mconfigId: item.tiles[0].mconfigId,
      queryId: item.tiles[0].queryId
    });
  }

  async showChart(item: common.ChartX) {
    this.spinner.show(item.chartId);

    let payloadGetChart: apiToBackend.ToBackendGetChartRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      chartId: item.chartId,
      timezone: this.timezoneForm.controls['timezone'].value
    };

    let query: common.Query;
    let mconfig: common.MconfigX;

    await this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetChart,
        payload: payloadGetChart
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetChartResponse) => {
          this.spinner.hide(item.chartId);

          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);

            query = resp.payload.chart.tiles[0].query;
            mconfig = resp.payload.chart.tiles[0].mconfig;
          }
        })
      )
      .toPromise();

    if (common.isUndefined(query)) {
      return;
    }

    let qData =
      mconfig.queryId === query.queryId
        ? this.dataService.makeQData({
            data: query.data,
            columns: mconfig.fields
          })
        : [];

    let checkSelectResult = getSelectValid({
      chart: mconfig.chart,
      mconfigFields: mconfig.fields
    });

    let isSelectValid = checkSelectResult.isSelectValid;
    // let errorMessage = checkSelectResult.errorMessage;

    this.myDialogService.showChart({
      apiService: this.apiService,
      mconfig: mconfig,
      query: query,
      qData: qData,
      canAccessModel: item.tiles[0].hasAccessToModel,
      showNav: true,
      isSelectValid: isSelectValid,
      dashboardId: undefined,
      chartId: item.chartId
    });
  }

  rowMenuOnClick(event: any) {
    event.stopPropagation();
  }

  goToChartFile(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    let fileIdAr = item.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  async editChartInfo(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    let payloadGetMconfig: apiToBackend.ToBackendGetMconfigRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      mconfigId: item.tiles[0].mconfigId
    };

    let mconfig: common.MconfigX = await this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
        payload: payloadGetMconfig
      })
      .pipe(
        map((resp: apiToBackend.ToBackendGetMconfigResponse) => {
          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            return resp.payload.mconfig;
          }
        })
      )
      .toPromise();

    if (common.isUndefined(mconfig)) {
      return;
    }

    this.myDialogService.showEditChartInfo({
      apiService: this.apiService,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      chart: item,
      mconfig: mconfig
    });
  }

  deleteChart(event: MouseEvent, item: common.ChartX) {
    event.stopPropagation();

    this.myDialogService.showDeleteChart({
      chart: item,
      apiService: this.apiService,
      chartDeletedFnBindThis: this.chartDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd
    });
  }

  goToModel(modelId: string) {
    this.navigateService.navigateToModel(modelId);
  }

  timezoneChange() {
    (document.activeElement as HTMLElement).blur();

    let timezone = this.timezoneForm.controls['timezone'].value;

    this.uiQuery.updatePart({ timezone: timezone });
    this.uiService.setUserUi({ timezone: timezone });

    if (this.showList === false) {
      // to rerender tiles with changed timezone
      this.isShow = false;
      setTimeout(() => {
        this.isShow = true;
      });
    }

    let url = this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: { timezone: timezone.split('/').join('-') }
      })
      .toString();

    this.location.go(url);
  }

  timezoneSearchFn(term: string, timezone: { value: string; label: string }) {
    let haystack = [`${timezone.label}`];

    let opts = {};
    let uf = new uFuzzy(opts);
    let idxs = uf.filter(haystack, term);

    return idxs != null && idxs.length > 0;
  }
}

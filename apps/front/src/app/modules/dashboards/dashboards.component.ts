import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import FuzzySearch from 'fuzzy-search';
import { NgxSpinnerService } from 'ngx-spinner';
import { take, tap } from 'rxjs/operators';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService } from '~front/app/services/query.service';
import { apiToBackend } from '~front/barrels/api-to-backend';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

export class ModelXWithTotalDashboards extends common.ModelX {
  totalDashboards: number;
}

@Component({
  selector: 'm-dashboards',
  templateUrl: './dashboards.component.html'
})
export class DashboardsComponent implements OnInit, OnDestroy {
  restrictedUserAlias = common.RESTRICTED_USER_ALIAS;

  pageTitle = constants.DASHBOARDS_PAGE_TITLE;

  dashboardDeletedFnBindThis = this.dashboardDeletedFn.bind(this);

  // groups: string[];

  showBricks = false;
  showTiles = false;

  isShow = true;

  dashboardsModels: ModelXWithTotalDashboards[];
  hasAccessModels: common.ModelX[] = [];

  dashboards: common.DashboardX[];
  dashboardsFilteredByWord: common.DashboardX[];
  filteredDashboards: common.DashboardX[];

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

  dashboards$ = this.dashboardsQuery.select().pipe(
    tap(x => {
      this.dashboards = x.dashboards;

      this.modelsQuery
        .select()
        .pipe(take(1))
        .subscribe(ml => {
          this.hasAccessModels = ml.models.filter(m => m.hasAccess === true);

          this.dashboardsModels = ml.models.map(y =>
            Object.assign({}, y, <ModelXWithTotalDashboards>{
              totalDashboards: this.dashboards.filter(
                v => v.tiles.map(rp => rp.modelId).indexOf(y.modelId) > -1
              ).length
            })
          );

          // let allGroups = this.vizs.map(v => v.gr);
          // let definedGroups = allGroups.filter(y => common.isDefined(y));
          // this.groups = [...new Set(definedGroups)];

          this.makeFilteredDashboards();

          this.cd.detectChanges();
        });
    })
  );

  modelId: string;

  word: string;
  // fileName: string;

  alias: string;
  alias$ = this.userQuery.alias$.pipe(
    tap(x => {
      this.alias = x;
      this.cd.detectChanges();
    })
  );

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private userQuery: UserQuery,
    private queryService: QueryService,
    private dashboardsQuery: DashboardsQuery,
    private spinner: NgxSpinnerService,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

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
      common.isDefined(this.word)
      // || common.isDefined(this.fileName)
    ) {
      const url = this.router
        .createUrlTree([], { relativeTo: this.route, queryParams: {} })
        .toString();

      this.location.go(url);
    }
  }

  modelOnClick(modelId: string) {
    if (this.modelId === modelId) {
      return;
    }
    this.modelId = modelId;
    this.makeFilteredDashboards();
  }

  allModelsOnClick() {
    if (common.isUndefined(this.modelId)) {
      return;
    }
    this.modelId = undefined;
    this.makeFilteredDashboards();
  }

  makeFilteredDashboards() {
    const searcher = new FuzzySearch(
      this.dashboards,
      ['title', 'dashboardId'],
      {
        caseSensitive: false
      }
    );

    this.dashboardsFilteredByWord = common.isDefined(this.word)
      ? searcher.search(this.word)
      : this.dashboards;

    this.filteredDashboards = common.isDefined(this.modelId)
      ? this.dashboardsFilteredByWord.filter(
          d => d.tiles.map(rp => rp.modelId).indexOf(this.modelId) > -1
        )
      : this.dashboardsFilteredByWord;

    this.filteredDashboards = this.filteredDashboards.sort((a, b) => {
      let aTitle = a.title || a.dashboardId;
      let bTitle = b.title || b.dashboardId;

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    this.dashboardsModels = this.dashboardsModels
      .map(x =>
        Object.assign({}, x, {
          totalDashboards: this.dashboardsFilteredByWord.filter(
            d => d.tiles.map(rp => rp.modelId).indexOf(x.modelId) > -1
          ).length
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
  }

  dashboardDeletedFn(deletedDashboardId: string) {
    this.dashboards = this.dashboards.filter(
      x => x.dashboardId !== deletedDashboardId
    );

    this.makeFilteredDashboards();
    this.cd.detectChanges();
  }

  trackByFn(index: number, item: common.DashboardX) {
    return item.dashboardId;
  }

  searchWordChange() {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.timer = setTimeout(() => {
      this.makeFilteredDashboards();
      this.cd.detectChanges();
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredDashboards();
    this.cd.detectChanges();
  }

  newDashboard() {
    this.myDialogService.showDashboardsNew({
      apiService: this.apiService
    });
  }

  goToDashboardFile(event: any, dashboard: common.DashboardX) {
    event.stopPropagation();

    let fileIdAr = dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      panel: common.PanelEnum.Tree,
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  goToMconfig(tile: common.TileX) {
    this.navigateService.navigateMconfigQuery({
      modelId: tile.modelId,
      mconfigId: tile.mconfigId,
      queryId: tile.queryId
    });
  }

  async showChart(tile: common.TileX, dashboardId: string) {
    this.spinner.show(tile.mconfigId);

    let tileX: common.TileX;

    let payloadGetDashboardTile: apiToBackend.ToBackendGetDashboardTileRequestPayload =
      {
        projectId: this.nav.projectId,
        branchId: this.nav.branchId,
        envId: this.nav.envId,
        isRepoProd: this.nav.isRepoProd,
        dashboardId: dashboardId,
        mconfigId: tile.mconfigId
      };

    let query: common.Query;
    let mconfig: common.MconfigX;

    await this.apiService
      .req({
        pathInfoName:
          apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetDashboardTile,
        payload: payloadGetDashboardTile
      })
      .pipe(
        tap((resp: apiToBackend.ToBackendGetDashboardTileResponse) => {
          this.spinner.hide(tile.mconfigId);

          if (resp.info?.status === common.ResponseInfoStatusEnum.Ok) {
            this.memberQuery.update(resp.payload.userMember);
            tileX = resp.payload.tile;
            query = resp.payload.tile.query;
            mconfig = resp.payload.tile.mconfig;
          }
        })
      )
      .toPromise();

    if (common.isUndefined(query)) {
      return;
    }

    let qData =
      mconfig.queryId === query.queryId
        ? this.queryService.makeQData({
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
      canAccessModel: tileX.hasAccessToModel,
      showNav: true,
      isSelectValid: isSelectValid,
      dashboardId: dashboardId,
      vizId: undefined,
      listen: tileX.listen
    });
  }

  deleteDashboard(event: MouseEvent, item: common.DashboardX) {
    event.stopPropagation();

    this.myDialogService.showDeleteDashboard({
      dashboard: item,
      apiService: this.apiService,
      dashboardDeletedFnBindThis: this.dashboardDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      envId: this.nav.envId,
      isRepoProd: this.nav.isRepoProd,
      isStartSpinnerUntilNavEnd: false
    });
  }

  goToModel(modelId: string) {
    this.navigateService.navigateToModel(modelId);
  }

  refreshShow() {
    this.isShow = false;
    setTimeout(() => {
      this.isShow = true;
    });
  }

  toggleShowFilters() {
    this.showBricks = !this.showBricks;
    this.refreshShow();
  }

  toggleShowTiles() {
    this.showTiles = !this.showTiles;
    this.refreshShow();
  }

  navigateToDashboard(dashboardId: string) {
    this.navigateService.navigateToDashboard(dashboardId);
  }

  ngOnDestroy() {
    // console.log('ngOnDestroyDashboards')
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }
}

import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { filter, take, tap } from 'rxjs/operators';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery, NavState } from '~front/app/queries/nav.query';
import { UserQuery } from '~front/app/queries/user.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

import uFuzzy from '@leeoniya/ufuzzy';
import { DashboardQuery } from '~front/app/queries/dashboard.query';

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

  pathDashboards = common.PATH_DASHBOARDS;

  // groups: string[];

  showBricks = false;
  showTiles = false;

  isShow = true;

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

  dashboardsModels: ModelXWithTotalDashboards[];
  hasAccessModels: common.ModelX[] = [];

  draftsLength: number;

  dashboards: common.DashboardX[];
  dashboardsFilteredByWord: common.DashboardX[];
  filteredDashboards: common.DashboardX[];

  dashboards$ = this.dashboardsQuery.select().pipe(
    tap(x => {
      this.dashboards = x.dashboards;

      this.draftsLength = this.dashboards.filter(y => y.temp === true).length;

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

  dashboard: common.DashboardX;
  dashboard$ = this.dashboardQuery.select().pipe(
    filter(x => common.isDefined(x.dashboardId)),
    tap(x => {
      this.dashboard = x;
      this.cd.detectChanges();
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

  lastUrl: string;

  routerEvents$ = this.router.events.pipe(
    filter(ev => ev instanceof NavigationEnd),
    tap((x: any) => {
      let ar = x.url.split('/');
      this.lastUrl = ar[ar.length - 1];
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
    private dashboardsQuery: DashboardsQuery,
    private dashboardQuery: DashboardQuery,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    private myDialogService: MyDialogService,
    private navigateService: NavigateService,
    private location: Location,
    private title: Title
  ) {}

  ngOnInit() {
    this.title.setTitle(this.pageTitle);

    let ar = this.router.url.split('/');
    this.lastUrl = ar[ar.length - 1];

    this.word = this.route.snapshot.queryParamMap.get('search');
    this.searchWordChange();
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
    let idxs;

    if (common.isDefinedAndNotEmpty(this.word)) {
      let haystack = this.dashboards.map(x => `${x.title} ${x.dashboardId}`);
      let opts = {};
      let uf = new uFuzzy(opts);
      idxs = uf.filter(haystack, this.word);
    }

    this.dashboardsFilteredByWord = common.isDefinedAndNotEmpty(this.word)
      ? idxs != null && idxs.length > 0
        ? idxs.map(idx => this.dashboards[idx])
        : []
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

  deleteDrafts() {}

  addDashboard() {}

  deleteDraftDashboard(event: any, dashboard: common.DashboardX) {
    event.stopPropagation();
  }

  dashboardSaveAs(event: any) {
    event.stopPropagation();
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

      let url = this.router
        .createUrlTree([], {
          relativeTo: this.route,
          queryParams: {
            search: common.isDefinedAndNotEmpty(this.word)
              ? this.word
              : undefined
          }
        })
        .toString();

      this.location.replaceState(url);
    }, 600);
  }

  resetSearch() {
    this.word = undefined;
    this.makeFilteredDashboards();
    this.cd.detectChanges();

    let url = this.router
      .createUrlTree([], {
        relativeTo: this.route,
        queryParams: {
          search: common.isDefinedAndNotEmpty(this.word) ? this.word : undefined
        }
      })
      .toString();

    this.location.replaceState(url);
  }

  newDashboard() {
    this.myDialogService.showDashboardsNew({
      apiService: this.apiService
    });
  }

  rowMenuOnClick(event: any) {
    event.stopPropagation();
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
    // this.isShow = false;
    // setTimeout(() => {
    //   this.isShow = true;
    // });
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

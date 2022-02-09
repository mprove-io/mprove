import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import FuzzySearch from 'fuzzy-search';
import { NgxSpinnerService } from 'ngx-spinner';
import { map, take, tap } from 'rxjs/operators';
import { getSelectValid } from '~front/app/functions/get-select-valid';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsQuery } from '~front/app/queries/models.query';
import { NavQuery } from '~front/app/queries/nav.query';
import { UiQuery } from '~front/app/queries/ui.query';
import { ApiService } from '~front/app/services/api.service';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { QueryService } from '~front/app/services/query.service';
import { NavState } from '~front/app/stores/nav.store';
import { UiStore } from '~front/app/stores/ui.store';
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
  pageTitle = constants.DASHBOARDS_PAGE_TITLE;

  dashboardDeletedFnBindThis = this.dashboardDeletedFn.bind(this);

  // groups: string[];

  showBricks = false;
  showReports = false;

  isShow = true;

  bufferAmount = 10;
  enableUnequalChildrenSizes = true;

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

          this.dashboardsModels = ml.models.map(z =>
            Object.assign({}, z, <ModelXWithTotalDashboards>{
              totalDashboards: this.dashboards.filter(
                v => v.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
              ).length
            })
          );

          // let allGroups = this.vizs.map(z => z.gr);
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

  private timer: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private apiService: ApiService,
    private navQuery: NavQuery,
    private queryService: QueryService,
    private dashboardsQuery: DashboardsQuery,
    private spinner: NgxSpinnerService,
    private modelsQuery: ModelsQuery,
    private memberQuery: MemberQuery,
    public uiStore: UiStore,
    public uiQuery: UiQuery,
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
          d => d.reports.map(rp => rp.modelId).indexOf(this.modelId) > -1
        )
      : this.dashboardsFilteredByWord;

    this.filteredDashboards = this.filteredDashboards.sort((a, b) => {
      let aTitle = a.title || a.dashboardId;
      let bTitle = b.title || b.dashboardId;

      return aTitle > bTitle ? 1 : bTitle > aTitle ? -1 : 0;
    });

    this.dashboardsModels = this.dashboardsModels
      .map(z =>
        Object.assign({}, z, {
          totalDashboards: this.dashboardsFilteredByWord.filter(
            d => d.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
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
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  goToMconfig(report: common.ReportX) {
    this.navigateService.navigateMconfigQuery({
      modelId: report.modelId,
      mconfigId: report.mconfigId,
      queryId: report.queryId
    });
  }

  async showChart(item: common.ReportX, dashboardId: string) {
    this.spinner.show(item.mconfigId);

    let payloadGetMconfig: apiToBackend.ToBackendGetMconfigRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
      mconfigId: item.mconfigId
    };

    let mconfig: common.MconfigX = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetMconfig,
        payloadGetMconfig
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetMconfigResponse) =>
            resp.payload.mconfig
        )
      )
      .toPromise();

    let payloadGetQuery: apiToBackend.ToBackendGetQueryRequestPayload = {
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd,
      mconfigId: item.mconfigId,
      queryId: item.queryId,
      dashboardId: dashboardId
    };

    let query: common.Query = await this.apiService
      .req(
        apiToBackend.ToBackendRequestInfoNameEnum.ToBackendGetQuery,
        payloadGetQuery
      )
      .pipe(
        map(
          (resp: apiToBackend.ToBackendGetQueryResponse) => resp.payload.query
        )
      )
      .toPromise();

    let qData =
      mconfig.queryId === query.queryId
        ? this.queryService.makeQData({
            data: query.data,
            columns: mconfig.fields
          })
        : [];

    // let canAccessModel = checkAccessModel({
    //   model: model,
    //   member: this.member
    // });

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
      canAccessModel: item.hasAccessToModel,
      showNav: true,
      isSelectValid: isSelectValid,
      dashboardId: dashboardId,
      vizId: undefined
    });

    this.spinner.hide(item.mconfigId);
  }

  deleteDashboard(event: MouseEvent, item: common.DashboardX) {
    event.stopPropagation();

    this.myDialogService.showDeleteDashboard({
      dashboard: item,
      apiService: this.apiService,
      dashboardDeletedFnBindThis: this.dashboardDeletedFnBindThis,
      projectId: this.nav.projectId,
      branchId: this.nav.branchId,
      isRepoProd: this.nav.isRepoProd
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

  toggleShowReports() {
    this.showReports = !this.showReports;
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

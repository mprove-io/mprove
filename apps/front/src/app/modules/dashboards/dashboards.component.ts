import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import FuzzySearch from 'fuzzy-search';
import { take, tap } from 'rxjs/operators';
import { DashboardsQuery } from '~front/app/queries/dashboards.query';
import { MemberQuery } from '~front/app/queries/member.query';
import { ModelsListQuery } from '~front/app/queries/models-list.query';
import { MyDialogService } from '~front/app/services/my-dialog.service';
import { NavigateService } from '~front/app/services/navigate.service';
import { DashboardWithExtendedFilters } from '~front/app/stores/dashboards.store';
import { common } from '~front/barrels/common';
import { constants } from '~front/barrels/constants';

class DashboardsModelsItemExtended extends common.ModelsItem {
  totalDashboards: number;
  hasAccess: boolean;
}

@Component({
  selector: 'm-dashboards',
  templateUrl: './dashboards.component.html'
})
export class DashboardsComponent implements OnInit, OnDestroy {
  pageTitle = constants.DASHBOARDS_PAGE_TITLE;

  // groups: string[];

  showBricks = true;
  showReports = true;
  showModels = true;

  isShow = true;

  bufferAmount = 10;
  enableUnequalChildrenSizes = true;

  modelsList: common.ModelsItem[];
  dashboardsModelsList: DashboardsModelsItemExtended[];

  dashboards: DashboardWithExtendedFilters[];
  dashboardsFilteredByWord: DashboardWithExtendedFilters[];
  filteredDashboards: DashboardWithExtendedFilters[];

  hasAccessModelsList: DashboardsModelsItemExtended[] = [];
  hasNoAccessModelsList: DashboardsModelsItemExtended[] = [];

  isExplorer = false;
  isExplorer$ = this.memberQuery.isExplorer$.pipe(
    tap(x => {
      this.isExplorer = x;
      this.cd.detectChanges();
    })
  );

  allModelsList: common.ModelsItem[] = [];

  dashboards$ = this.dashboardsQuery.select().pipe(
    tap(x => {
      this.dashboards = x.dashboards;

      this.modelsListQuery
        .select()
        .pipe(take(1))
        .subscribe(ml => {
          this.modelsList = ml.modelsList;

          this.hasAccessModelsList = this.modelsList.map(z =>
            Object.assign({}, z, <DashboardsModelsItemExtended>{
              totalDashboards: this.dashboards.filter(
                v => v.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
              ).length,
              hasAccess: true
            })
          );

          this.allModelsList = ml.allModelsList;

          this.hasNoAccessModelsList = this.allModelsList
            .filter(
              c => this.modelsList.findIndex(b => b.modelId === c.modelId) < 0
            )
            .map(z =>
              Object.assign({}, z, <DashboardsModelsItemExtended>{
                totalDashboards: this.dashboards.filter(
                  v => v.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
                ).length,
                hasAccess: false
              })
            );

          this.dashboardsModelsList = [
            ...this.hasAccessModelsList,
            ...this.hasNoAccessModelsList
          ].sort((a, b) =>
            a.label > b.label ? 1 : b.label > a.label ? -1 : 0
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
    private dashboardsQuery: DashboardsQuery,
    private modelsListQuery: ModelsListQuery,
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
          d => d.reports.map(rp => rp.modelId).indexOf(this.modelId) > -1
        )
      : this.dashboardsFilteredByWord;

    this.filteredDashboards = this.filteredDashboards.sort((a, b) =>
      a.title > b.title ? 1 : b.title > a.title ? -1 : 0
    );

    this.dashboardsModelsList = this.dashboardsModelsList
      .map(z =>
        Object.assign({}, z, {
          totalDashboards: this.dashboardsFilteredByWord.filter(
            d => d.reports.map(rp => rp.modelId).indexOf(z.modelId) > -1
          ).length
        })
      )
      .sort((a, b) => (a.label > b.label ? 1 : b.label > a.label ? -1 : 0));
  }

  // dashboardDeleted(deletedVizId: string) {
  //   let deletedVizModelId = this.dashboardsList.find(viz => viz.vizId === deletedVizId)
  //     ?.modelId;

  //   this.dashboardsList = this.dashboardsList.filter(x => x.vizId !== deletedVizId);

  //   if (common.isDefined(deletedVizModelId)) {
  //     let modelItemExtended = this.vizsModelsList.find(
  //       x => x.modelId === deletedVizModelId
  //     );
  //     if (common.isDefined(modelItemExtended)) {
  //       modelItemExtended.totalVizs = modelItemExtended.totalVizs - 1;
  //     }
  //   }

  //   this.makeFilteredVizs();
  //   this.cd.detectChanges();
  // }

  trackByFn(index: number, item: DashboardWithExtendedFilters) {
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
    // if (
    //   this.isExplorer === false ||
    //   !this.modelsList ||
    //   this.modelsList.length === 0
    // ) {
    //   return;
    // }
    // this.myDialogService.showNewViz({
    //   modelsList: this.modelsList
    // });
  }

  goToDashboardFile(event: any, dashboard: DashboardWithExtendedFilters) {
    event.stopPropagation();

    let fileIdAr = dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  goToModelFile(modelId: string) {
    let model = this.allModelsList.find(x => x.modelId === modelId);

    let fileIdAr = model.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
  }

  goToDashboard(dashboard: DashboardWithExtendedFilters) {
    let fileIdAr = dashboard.filePath.split('/');
    fileIdAr.shift();

    this.navigateService.navigateToFileLine({
      underscoreFileId: fileIdAr.join(common.TRIPLE_UNDERSCORE)
    });
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

  toggleShowModels() {
    this.showModels = !this.showModels;
    // this.refreshShow();
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
